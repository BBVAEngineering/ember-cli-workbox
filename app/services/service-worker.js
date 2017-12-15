import Ember from 'ember';

const { Service, computed, Evented, debug } = Ember;

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
*		newSWActive: new sw controlling page
* 		newSWWaiting: new sw waiting for controlling page
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

	_register(swFile) {
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
			// SW is waiting to activate. Can occur if multiple clients open and
			// one of the clients is refreshed.
			newSWwaiting();
			return;
		}
		if (reg.installing) {
			this.awaitStateChange.bind(this, reg, newSWwaiting);
			return;
		}

		// We are currently controlled so a new SW may be found...
		// Add a listener in case a new SW is found,
		reg.addEventListener('updatefound', this.awaitStateChange.bind(this, reg, newSWwaiting));
	},

	/*
	* Listen for further changes to the new service worker's state.
	*/
	awaitStateChange(reg, newSWwaiting) {
		reg.installing.addEventListener('statechange', (event) => {
			if (event.target.state === 'installed') {
				// A new service worker is available, inform the user
				newSWwaiting(reg);
			}
		});
	},

	newSWwaiting(sw) {
		this.log('newSWwaiting');
		this.trigger('newSWwaiting', sw);
	},

	/*
	* Send message to sw in order to launch skipWaiting and clients.claim on it
	* New sw will become active
	*/
	forceActivate(reg) {
		this.log('forceActivate');
		reg.waiting.postMessage('force-activate');
	},

	/*
	* This fires when the service worker controlling this page
	* changes, eg a new worker has as skipped waiting and become
	* the new active worker. (Notfiy new version installed)
	*/
	_watchUpdates() {
		this.get('sw').addEventListener('message', (event) => {
			if (!event.data) {
				return;
			}

			switch (event.data) {
				case 'reload-window':
					this.trigger('newSWActive');
					this.log('New service worker controlling page. You should reload');
					break;
				default:
					// NOOP
					break;
			}
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
							this.log(`Error unregistering ${reg}`);
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
