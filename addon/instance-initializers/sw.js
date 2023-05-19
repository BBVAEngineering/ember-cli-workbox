import { debug } from '@ember/debug';
import { get } from '@ember/object';

function getWithDefault(obj, path, def) {
  const value = get(obj, path);

  return typeof value !== 'undefined' ? value : def;
}

export function getConfig(appInstance) {
  const config = appInstance.resolveRegistration('config:environment');
  const isProdBuild = config.environment === 'production';

  return {
    isEnabled: getWithDefault(config, 'ember-cli-workbox.enabled', isProdBuild),
    debugAddon: getWithDefault(config, 'ember-cli-workbox.debug', !isProdBuild),
    swDestFile: getWithDefault(config, 'ember-cli-workbox.swDest', 'sw.js'),
    autoRegister: getWithDefault(
      config,
      'ember-cli-workbox.autoRegister',
      true
    ),
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

    /* istanbul ignore else */
    if (autoRegister) {
      initialize(appInstance);
    }
  },
};
