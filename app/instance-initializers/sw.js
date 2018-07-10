import { get } from '@ember/object';
import { warn } from '@ember/debug';

export function initialize(appInstance) {
	const config = appInstance.resolveRegistration('config:environment');
	const isEnabled = get(config, 'ember-cli-workbox.enabled');
	const debugAddon = get(config, 'ember-cli-workbox.debug');
	const swDestFile = get(config, 'workbox.swDest');
	const swService = appInstance.lookup('service:service-worker');

	swService.set('debug', debugAddon);

	// first checks whether the browser supports service workers
	if (swService.get('isSupported')) {
		// Load and register pre-caching Service Worker
		if (isEnabled) {
			swService.register(swDestFile);
		} else {
			swService.unregisterAll().then(() => {
				const purgeOnDisable = get(config, 'ember-cli-workbox.purgeOnDisable');

				if (purgeOnDisable) {
					swService.purgeCache();
				}
			});
		}
	} else {
		warn('Service workers are not supported in this browser.');
	}
}

export default {
	name: 'ember-cli-workbox',
	initialize
};
