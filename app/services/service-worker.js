import Ember from 'ember';

const { Service, computed, Evented, debug, error } = Ember;

/*
*
* Service worker states:
*    "installing" - the install event has fired, but not yet complete
*    "installed"  - install complete
*    "activating" - the activate event has fired, but not yet complete
*    "activated"  - fully active
*    "redundant"  - discarded. Either failed install, or it's been
*                   replaced by a newer version
*  Events triggered:
* 		registrationComplete: sw successfully registered
*		registrationError: sw not registered
*		newActive: new sw controlling page
* 		newSWwaiting: new sw waiting for controlling page
*		unregistrationComplete: all sw are unregistered
*/

export default Service.extend(Evented, {

	sw: computed(() => window.navigator.serviceWorker),

	isSupported: computed.bool('sw'),

	debug: true,

	log(message) {
		if (this.get('debug')) {
			debug(`EmberCliServiceWorker: ${message}`);
		}
	},

	getCurrentControllingSW() {
		return this.get('sw').controller;
	},

	_register(swFile) {
		this._checkCurrentSW();
		this._watchUpdates();

		return this.get('sw').register(swFile).then(this.onRegistration.bind(this)).catch((err) => {
			this.trigger('registrationError');
			this.log('Service Worker registration failed: ', err);
		});
	},

	onRegistration(reg) {
		this.log(`Registration succeeded. Scope is ${reg.scope}`);
		this.trigger('registrationComplete');

		if (!reg) {
			return;
		}

		const newSWwaiting = this.newSWwaiting.bind(this, reg);

		if (reg.waiting) {
			newSWwaiting();
			return;
		}
		if (reg.installing) {
			this.awaitStateChange.bind(this, reg, newSWwaiting);
		}

		reg.addEventListener('updatefound', this.awaitStateChange.bind(this, reg, newSWwaiting));
	},

	// listen for further changes to the new service worker's state.
	awaitStateChange(reg, newSWwaiting) {
		reg.installing.addEventListener('statechange', function () {
			if (this.state === 'installed') {
				newSWwaiting(reg);
			}
		});
	},

	newSWwaiting(sw) {
		this.log('newSWwaiting');
		this.trigger('newSWwaiting', sw);
	},

	skipWaiting(reg) {
		this.log('skipwaiting');
		reg.waiting.postMessage('skipWaiting');
	},

	// Check to see if the service worker controlling the page at initial load
	// has become redundant, since this implies there's a new service worker with fresh content.
	_checkCurrentSW() {
		const myController = this.getCurrentControllingSW();

		if (myController) {
			myController.onstatechange = (event) => {
				if (event.target.state === 'redundant') {
					this.trigger('newWaiting');
					this.log('discarded. Either failed install, or its been replaced by a newer version. You should reload');
				}
			};
		}
	},

	// This fires when the service worker controlling this page
	// changes, eg a new worker has as skipped waiting and become
	// the new active worker. (Notfiy new version installed)
	_watchUpdates() {
		this.get('sw').addEventListener('controllerchange', () => {
			this.trigger('newActive');
			this.log('New service worker controlling page');
		});
	},

	/*
	* Utility function that unregisters SW, but you still need to reload to see SW removed completely
	* This does not delete items in Cache
	*/
	_unregisterAll() {
		return this.get('sw').getRegistrations().then((registrations) =>
			Promise.all(
				registrations.map((reg) =>
					reg.unregister().then((boolean) => {
						if (boolean) {
							this.log(`${reg} unregistered`);
						} else {
							error('Error unregistering ${reg}');
						}
					})
				)
			)
		).then(() => {
			this.trigger('unregistrationComplete');
			this.log('Unregistrations complete');
		});
	}

});
