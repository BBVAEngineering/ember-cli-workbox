import Ember from 'ember';

const { getWithDefault, debug } = Ember;

export function getConfig(appInstance) {
	const config = appInstance.resolveRegistration('config:environment');
	const isProdBuild = config.environment === 'production';

	return {
		isEnabled: getWithDefault(config, 'ember-cli-workbox.enabled', isProdBuild),
		debugAddon: getWithDefault(config, 'ember-cli-workbox.debug', !isProdBuild),
		swDestFile: getWithDefault(config, 'workbox.swDest', 'sw.js'),
		autoRegister: getWithDefault(config, 'ember-cli-workbox.autoRegister', true)
	};
}

export function initialize(appInstance) {
	const swService = appInstance.lookup('service:service-worker');
	const { isEnabled, debugAddon, swDestFile } = getConfig(appInstance);

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
	initialize(appInstance) {
		const { autoRegister } = getConfig(appInstance);

		if (autoRegister) {
			initialize(appInstance);
		}
	}
};
