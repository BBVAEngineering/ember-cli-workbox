'use strict';

const mergeTrees = require('broccoli-merge-trees');
const BroccoliWorkbox = require('./lib/broccoli-workbox');

module.exports = {
  name: require('./package').name,

  isDevelopingAddon: () => true,

  config(env, baseConfig) {
    const baseOptions = baseConfig['ember-cli-workbox'] || {};
    const appOptions =
      (this.app && this.app.options['ember-cli-workbox']) || {};
    const projectName = (baseConfig.APP && baseConfig.APP.name) || 'app';
    const appWorkboxOptions = (this.app && this.app.options.workbox) || {};

    const workboxOptions = Object.assign(
      // Defaults
      {
        swDest: 'sw.js',
        globDirectory: './',
        globPatterns: [
          '**/*.{json,css,js,png,svg,eot,ttf,woff,jpg,gif,ico,xml,html,txt}',
        ],
        skipWaiting: false,
        clientsClaim: false,
        cacheId: projectName,
      },
      // Options from environment config (workbox)
      appWorkboxOptions
    );

    // Do nothing if no ENV. For example, when running an ember generator.
    if (!env && !process.env.EMBER_ENV) {
      return;
    }

    const isProdBuild = Boolean(env.match('prod'));

    const options = Object.assign(
      // Defaults
      {
        enabled: isProdBuild,
        debug: !isProdBuild,
        importScriptsGlobPatterns: ['assets/service-workers/*.js'],
      },
      // Options from initial app config (ember-cli-workbox)
      baseOptions,
      // Options from environment config (ember-cli-workbox)
      appOptions
    );

    this._options = options;
    this.workboxOptions = workboxOptions;

    // Append "workbox" config to "ember-cli-workbox" config
    if (baseOptions) {
      baseOptions.swDest = workboxOptions.swDest;
    }
  },

  postprocessTree(type, tree) {
    if (type !== 'all') {
      return tree;
    }

    // This 'all' tree has all the app's files and assets,
    // which is exactly what we need for making a service worker using workbox

    // Our BroccoliWorkbox plugin will generate the service worker for the given tree
    const workboxFunnel = new BroccoliWorkbox([tree], {
      options: this._options,
      workboxOptions: this.workboxOptions,
    });

    // Add this BroccoliWorkbox tree to the app's tree
    return mergeTrees([tree, workboxFunnel], {
      overwrite: true,
    });
  },
};
