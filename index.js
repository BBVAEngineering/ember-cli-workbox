'use strict';

const mergeTrees = require('broccoli-merge-trees');
const BroccoliWorkbox = require('./lib/broccoli-workbox');

module.exports = {
  name: require('./package').name,

  isDevelopingAddon: () => true,

  config(env, baseConfig) {
    const emberCliWorkboxOptions = baseConfig['ember-cli-workbox'];
    const appOptions =
      (this.app && this.app.options['ember-cli-workbox']) || {};
    const projectName = (baseConfig.APP && baseConfig.APP.name) || 'app';
    let workboxOptions = (this.app && this.app.options.workbox) || {};
    let options = emberCliWorkboxOptions || {};

    workboxOptions = Object.assign(
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
      workboxOptions
    );

    env = env || process.env.EMBER_ENV;

    // Do nothing if no ENV. For example, when running an ember generator.
    /* istanbul ignore else */
    if (!env) {
      return;
    }

    const isProdBuild = Boolean(env.match('prod'));

    options = Object.assign(
      {
        enabled: isProdBuild,
        debug: !isProdBuild,
        importScriptsGlobPatterns: ['assets/service-workers/*.js'],
      },
      options,
      appOptions
    );

    this._options = options;
    this.workboxOptions = workboxOptions;

    // Append "workbox" config to "ember-cli-workbox" config
    if (emberCliWorkboxOptions) {
      emberCliWorkboxOptions.swDest = workboxOptions.swDest;
    }
  },

  processTree(app, tree) {
    let emberCliWorkboxAddon = app.project.addons.find(
      ({ name }) => name === 'ember-cli-workbox'
    );

    if (!emberCliWorkboxAddon) {
      throw new Error(
        "Could not find initialized ember-cli-workbox addon. It must be part of your app's dependencies!"
      );
    }

    return emberCliWorkboxAddon._processTree(tree);
  },

  _processTree(tree) {
    const workboxFunnel = new BroccoliWorkbox([tree], {
      options: this._options,
      workboxOptions: this.workboxOptions,
    });

    return mergeTrees([tree, workboxFunnel], {
      overwrite: true,
    });
  },

  postprocessTree(type, tree) {
    if (type !== 'all') {
      return tree;
    }

    const workboxFunnel = new BroccoliWorkbox([tree], {
      options: this._options,
      workboxOptions: this.workboxOptions,
    });

    return mergeTrees([tree, workboxFunnel], {
      overwrite: true,
    });
  },
};
