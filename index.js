/* eslint-disable no-sync */
'use strict';
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const BroccoliWorkbox = require('./lib/broccoli-workbox');

module.exports = {
  name: require('./package').name,

  isDevelopingAddon: () => true,

  config(env, baseConfig) {
    const workboxOptions = (this.app && this.app.options.workbox) || {};
    const emberCliWorkboxOptions = baseConfig['ember-cli-workbox'];
    const options = emberCliWorkboxOptions || {};
    const appOptions =
      (this.app && this.app.options['ember-cli-workbox']) || {};
    const projectName = (baseConfig.APP && baseConfig.APP.name) || 'app';

    Object.assign(workboxOptions, {
      swDest: 'sw.js',
      globDirectory: './',
      globPatterns: [
        '**/*.{json,css,js,png,svg,eot,ttf,woff,jpg,gif,ico,xml,html,txt}',
      ],
      skipWaiting: false,
      clientsClaim: false,
      cacheId: projectName,
    });

    env = env || process.env.EMBER_ENV;

    // Do nothing if no ENV. For example, when running an ember generator.
    if (!env) {
      return;
    }

    const isProdBuild = Boolean(env.match('prod'));

    Object.assign(options, appOptions, {
      enabled: isProdBuild,
      debug: !isProdBuild,
      importScriptsGlobPatterns: ['assets/service-workers/*.js'],
    });

    this._options = options;
    this.workboxOptions = workboxOptions;

    // Append "workbox" config to "ember-cli-workbox" config
    if (emberCliWorkboxOptions) {
      emberCliWorkboxOptions.swDest = workboxOptions.swDest;
    }
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

  treeForPublic(tree) {
    const assetsTree = new Funnel('public');

    return mergeTrees([tree, assetsTree], {
      overwrite: true,
    });
  },
};
