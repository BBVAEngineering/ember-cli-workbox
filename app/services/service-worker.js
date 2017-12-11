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
* 		newWaiting: new sw waiting for controlling page
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

		return this.get('sw').register(swFile).then((registration) => {
			this.log('Registration succeeded. Scope is ' + registration.scope);
			this.trigger('registrationComplete');

			registration.onupdatefound = () => {
				const newWorker = registration.installing;

				// listen for further changes to the new service worker's state.
				newWorker.onstatechange = () => {
					switch (newWorker.state) {
						case 'installing':
							this.log('Installing a new service worker...');
							break;
						case 'installed':
							this.log(navigator.serviceWorker.controller);
							// We check the active controller which tells us if
							// new content is available, or the current service worker
							// is up to date (?)
							// TODO: Figure out why this is the case
							if (!this.getCurrentControllingSW()) {
								this.trigger('newWaiting');
								this.log('New or updated content is available, refresh!');
							} else {
								this.log('Content is now available offline!');
							}
							break;
						case 'activating':
							this.log('Activating a service worker...');
							break;
						case 'activated':
							this.log('Successfully activated service worker.');
							break;
						case 'redundant':
							this.log('The installing service worker has become redundant');
							break;
					}
				};
			};
		}).catch((err) => {
			this.trigger('registrationError');
			this.log('Service Worker registration failed: ', err)
		});
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
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			this.trigger('newActive');
			this.log('New service worker controlling page');
		});
	},

	_unregisterAll() {
		return this.get('sw').getRegistrations().then((registrations) =>
			Promise.all(
				registrations.map((reg) =>
					reg.unregister().then((boolean) => {
						if (boolean) {
							this.log(`${reg} unregistered`)
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
