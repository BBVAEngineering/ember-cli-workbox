import Ember from 'ember';

const { getWithDefault, debug } = Ember;

export function initialize(appInstance) {
	const config = appInstance.resolveRegistration('config:environment');
	const isProdBuild = config.environment === 'production';
	const isEnabled = getWithDefault(config, 'ember-cli-workbox.enabled', isProdBuild);
	const debugAddon = getWithDefault(config, 'ember-cli-workbox.debug', !isProdBuild);
	const swDestFile = getWithDefault(config, 'workbox.swDest', 'sw.js');
	const swService = appInstance.lookup('service:service-worker');

	swService.set('debug', debugAddon);

	// first checks whether the browser supports service workers
	if (swService.get('isSupported')) {
		// Load and register pre-caching Service Worker
		if (isEnabled) {
			swService.register(swDestFile);
		} else {
			swService.unregisterAll();
		}
	} else {
		debug('Service workers are not supported in this browser.');
	}
}

export default {
	name: 'ember-cli-workbox',
	initialize
};
