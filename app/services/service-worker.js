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

	debug: false,

	_log(message) {
		if (this.get('debug')) {
			debug(`EmberCliServiceWorker: ${message}`);
		}
	},

	register(swFile) {
		this._watchUpdates();

		return this.get('sw').register(swFile).then(this._onRegistration.bind(this)).catch((error) => {
			this.trigger('registrationError', error);
			this._log('Service Worker registration failed: ', error);
		});
	},

	/*
	* Utility function that unregisters SW, but you still need to reload to see SW removed completely
	* This does not delete items in Cache
	*/
	unregisterAll() {
		return this.get('sw').getRegistrations().then((registrations) =>
			Promise.all(
				registrations.map((reg) =>
					reg.unregister().then((boolean) => {
						if (boolean) {
							this._log(`${reg} unregistered`);
						} else {
							this._log(`Error unregistering ${reg}`);
						}
					})
				)
			)
		).then(() => {
			this.trigger('unregistrationComplete');
			this._log('Unregistrations complete');
		});
	},

	/*
	* Send message to sw in order to launch skipWaiting and clients.claim on it
	* New sw will become active
	*/
	forceActivate(reg) {
		this._log('Forcing serviceWorker to activate');
		reg.waiting.postMessage('force-activate');
	},


	_onRegistration(reg) {
		this._log(`Registration succeeded. Scope is ${reg.scope}`);
		this.trigger('registrationComplete');

		if (!reg) {
			return;
		}

		if (reg.waiting) {
			// SW is waiting to activate. Can occur if multiple clients open and
			// one of the clients is refreshed.
			this._newSWwaiting(reg);
			return;
		}
		if (reg.installing) {
			this._awaitStateChange(reg);
			return;
		}

		// We are currently controlled so a new SW may be found...
		// Add a listener in case a new SW is found,
		reg.addEventListener('updatefound', this._awaitStateChange.bind(this, reg));
	},

	/*
	* Listen for further changes to the new service worker's state.
	*/
	_awaitStateChange(reg) {
		reg.installing.addEventListener('statechange', (event) => {
			if (event.target.state === 'installed') {
				// A new service worker is available, inform the user
				this._newSWwaiting(reg);
			}
		});
	},

	_newSWwaiting(reg) {
		this._log('New service worker is waiting to activate');
		this.trigger('newSWwaiting', reg);
	},

	/*
	* This fires when the service worker controlling this page
	* changes, eg a new worker has as skipped waiting and become
	* the new active worker. (Notfiy new version installed)
	*/
	_watchUpdates() {
		this.get('sw').addEventListener('message', ({ data }) => {
			if (data === 'reload-window') {
				this.trigger('newSWActive');
				this._log('New service worker controlling page. You should reload');
			}
		});
	}

});
