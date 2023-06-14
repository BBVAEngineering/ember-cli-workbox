import Service from '@ember/service';
import Evented from '@ember/object/evented';
import { debug } from '@ember/debug';
import { getOwner } from '@ember/application';

const EventedService = Service.extend(Evented);

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
 *	"error"						- sw not registered
 *	"waiting"					- new sw waiting for controlling page
 *	"activated"					- the new sw is ready to respond
 *	"registrationComplete"		- sw successfully registered
 *	"unregistrationComplete"	- all sw are unregistered
 */
export default class ServiceWorker extends EventedService {
  get config() {
    return getOwner(this).resolveRegistration('config:environment');
  }

  constructor() {
    super(...arguments);

    const sw = window.navigator.serviceWorker;
    let isSupported = false;

    /* istanbul ignore else */
    if (sw) {
      isSupported = ['getRegistrations', 'register'].every(
        (func) => func in sw
      );
    }

    this.sw = sw;
    this.isSupported = isSupported;
  }

  _log(message) {
    /* istanbul ignore else */
    if (this.debug) {
      debug(`ember-cli-workbox: ${message}`);
    }
  }

  async register(swFile) {
    try {
      const registration = await this.sw.register(
        `${this.config.rootURL}${swFile}`
      );

      return this._onRegistration(registration);
    } catch (error) {
      this.trigger('error', error);
      this._log('Service Worker registration failed: ', error);

      throw error;
    }
  }

  /*
   * Utility function that unregisters SW, but you still need to reload to see SW removed completely
   * This does not delete items in Cache
   */
  async unregisterAll() {
    const registrations = await this.sw.getRegistrations();

    await Promise.all(
      registrations.map(async (reg) => {
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
  }

  _onRegistration(registration) {
    this._log(`Registration succeeded. Scope is ${registration.scope}`);
    this.trigger('registrationComplete');

    /* istanbul ignore else */
    if (!registration) {
      return;
    }

    /* istanbul ignore else */
    if (registration.waiting) {
      // SW is waiting to activate. Can occur if multiple clients open and
      // one of the clients is refreshed.
      this._waiting(registration);
    }

    // We are currently controlled so a new SW may be found...
    // Add a listener in case a new SW is found,
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;

      /* istanbul ignore else */
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
    });
  }

  _checkSWInstalled(installingWorker, registration) {
    switch (installingWorker.state) {
      case 'installed':
        if (navigator.serviceWorker.controller) {
          // At this point, the updated precached content has been fetched,
          // but the previous service worker will still serve the older
          // content until all client tabs are closed.
          this._log(
            'New content is available and will be used when all tabs for this page are closed.'
          );

          // Execute callback
          this._waiting(registration);
        } else {
          // At this point, everything has been precached.
          // It's the perfect time to display a "Content is cached for offline use." message.
          this._log(
            'New serviceworker is controlling page. Content is now available offline!'
          );
        }
        break;
      default:
        break;
    }
  }

  _waiting(registration) {
    this._log(
      'New serviceworker is waiting to activate. New or updated content is available.'
    );
    this.trigger('waiting', registration);

    registration.waiting.addEventListener('statechange', (event) => {
      if (event.target.state === 'activated') {
        this.trigger('activated', registration);
      }
    });
  }
}
