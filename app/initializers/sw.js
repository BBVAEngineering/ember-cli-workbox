import Ember from 'ember';

const { getWithDefault } = Ember;

export function initialize(appInstance) {
	const config = appInstance.resolveRegistration('config:environment');
	const isEnabled = getWithDefault(config, 'workbox.enabled', config.environment === 'production');
	const swFile = getWithDefault(config, 'workbox.swFile', './assets/service-workers/sw.js');

	if (navigator.serviceWorker) {
		if (isEnabled) {
			navigator.serviceWorker.register(swFile);
		} else {
			navigator.serviceWorker.getRegistrations((registrations) => {
				registrations.forEach((registration) => {
					registration.unregister();
				});
			});
		}
	}
}

export default {
	name: 'ember-cli-workbox',
	initialize
};
