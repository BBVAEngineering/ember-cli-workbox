import Service from '@ember/service';
import Evented from '@ember/object/evented';
import { debug } from '@ember/debug';

/*
 *
 * Service worker states:
 *	"installing"				- the install event has fired, but is not yet completed
 *	"installed"					- install completed
 *	"activating"				- the activate event has fired, but is not yet completed
 *	"activated"					- fully active
 *	"redundant"					- discarded. Either failed install, or it's been replaced by a newer version
 *
 * Events triggered:
 *	"registrationComplete"		- sw successfully registered
 *	"registrationError"			- sw not registered
 *	"activated"					- new sw controlling page
 *	"waiting"					- new sw waiting for controlling page
 *	"updated"					- updated sw controlling page, need refresh
 *	"unregistrationComplete"	- all sw are unregistered
 */
export default Service.extend(Evented, {

	init() {
		this._super(...arguments);

		const sw = window.navigator.serviceWorker;
		let isSupported = false;

		if (sw) {
			isSupported = [
				'getRegistrations',
				'register'
			].every((func) => func in sw);
		}

		this.set('sw', sw);
		this.set('isSupported', isSupported);
	},

	_log(message) {
		if (this.debug) {
			debug(`ember-cli-workbox: ${message}`);
		}
	},

	async register(swFile) {
		this._watchUpdates();

		try {
			const registration = await this.sw.register(swFile);

			return this._onRegistration(registration);
		} catch (error) {
			this.trigger('registrationError', error);
			this._log('Service Worker registration failed: ', error);

			throw error;
		}
	},

	/*
	 * Utility function that unregisters SW, but you still need to reload to see SW removed completely
	 * This does not delete items in Cache
	 */
	async unregisterAll() {
		const registrations = await this.sw.getRegistrations();

		await Promise.all(
			registrations.map(async(reg) => {
				const boolean = await reg.unregister();

				if (boolean) {
					this._log(`${reg} unregistered`);
				} else {
					this._log(`Error unregistering ${reg}`);
				}
			})
		);

		this.trigger('unregistrationComplete');
		this._log('Unregistrations complete');
	},

	/*
	 * Send message to sw in order to launch skipWaiting and clients.claim on it
	 * New sw will become active
	 */
	forceActivate(reg) {
		this._log('Forcing serviceWorker to activate');
		reg.waiting.postMessage('force-activate');
	},

	_onRegistration(registration) {
		this._log(`Registration succeeded. Scope is ${registration.scope}`);
		this.trigger('registrationComplete');

		if (!registration) {
			return;
		}

		if (registration.waiting) {
			// SW is waiting to activate. Can occur if multiple clients open and
			// one of the clients is refreshed.
			this._waiting(registration);
		}

		// We are currently controlled so a new SW may be found...
		// Add a listener in case a new SW is found,
		registration.addEventListener('updatefound', this._awaitStateChange.bind(this, registration));
	},

	_awaitStateChange(registration) {
		this._log('Service Worker update found');

		const installingWorker = registration.installing;

		if (!installingWorker) {
			return;
		}

		if (installingWorker.state === 'installed') {
			this._checkSWInstalled(installingWorker, registration);
		} else {
			installingWorker.addEventListener('statechange', () => {
				this._checkSWInstalled(installingWorker, registration);
			});
		}
	},

	_checkSWInstalled(installingWorker, registration) {
		switch (installingWorker.state) {
			case 'installed':
				if (navigator.serviceWorker.controller) {
					// At this point, the updated precached content has been fetched,
					// but the previous service worker will still serve the older
					// content until all client tabs are closed.
					this._log('New content is available and will be used when all tabs for this page are closed.');

					// Execute callback
					this._waiting(registration);
				} else {
					// At this point, everything has been precached.
					// It's the perfect time to display a "Content is cached for offline use." message.
					this._log('New serviceworker is controlling page. Content is now available offline!');
					this.trigger('activated');
				}
				break;
			case 'redundant':
				this._log('The installing service worker became redundant.');
				break;
			default:
				break;
		}
	},

	_waiting(reg) {
		this._log('New serviceworker is waiting to activate. New or updated content is available.');
		this.trigger('waiting', reg);
	},

	/*
	 * This fires when the service worker controlling this page
	 * changes, eg a new worker has as skipped waiting and become
	 * the new active worker. (Notfiy new version installed)
	 */
	_watchUpdates() {
		this.sw.addEventListener('message', ({ data }) => {
			if (data === 'reload-window') {
				this.trigger('updated');
				this._log('New serviceworker controlling page. You should reload');
			}
		});
	}

});
