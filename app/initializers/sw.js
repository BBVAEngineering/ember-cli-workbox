import Ember from 'ember';

const { getWithDefault, debug, error } = Ember;

export function initialize(appInstance) {
	const config = appInstance.resolveRegistration('config:environment');
	const isEnabled = getWithDefault(config, 'ember-cli-workbox.enabled', config.environment === 'production');
	const swDestFile = getWithDefault(config, 'workbox.swDest', 'sw.js');
	const sw = navigator.serviceWorker;

	// first checks whether the browser supports service workers
	if (sw) {
		const myController = sw.controller;

		// Load and register pre-caching Service Worker
		if (isEnabled) {
			// register one sericeworker
			sw.register(swDestFile).then((registration) => {
				registration.onupdatefound = () => {
					const installingWorker = registration.installing;

					// listen for further changes to the service worker's state.
					installingWorker.onstatechange = () => {
						switch (installingWorker.state) {
							case 'installed':
								if (!myController) {
									debug('Caching complete! Future visits will work offline.');
								}
								break;
							case 'redundant': {
								debug('The installing service worker became redundant.');
							}
						}
					};
				};
				if (myController) {
					debug(`The service worker ${myController.scriptURL} is currently handling network operations.`);
				} else {
					debug('Please reload this page to allow the service worker to handle network operations.');
				}
			}).catch((err) =>
				debug('Service Worker registration failed: ', err)
			);


			// Check to see if the service worker controlling the page at initial load
			// has become redundant, since this implies there's a new service worker with fresh content.
			if (myController) {
				myController.onstatechange = (event) => {
					if (event.target.state === 'redundant') {
						debug('A new version of this app is available. You should reload');
					}
				};
			}
		} else {
			sw.getRegistrations().then((registrations) => {
				registrations.forEach((registration) => {
					registration.unregister().then(() => {
						debug('Service worker unregistered');
					}, (e) => {
						error('Error unregistering service worker', e);
					});
				});
			});
		}
	} else {
		debug('Service workers are not supported.');
	}
}

export default {
	name: 'ember-cli-workbox',
	initialize
};
