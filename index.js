/* eslint-disable no-sync */
'use strict';
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const BroccoliWorkbox = require('./lib/broccoli-workbox');

function mergeOptions(options, defaultOptions) {
	for (const option in defaultOptions) {
		if (!options.hasOwnProperty(option)) {
			options[option] = defaultOptions[option];
		}
	}

	return options;
}

module.exports = {
	name: require('./package').name,

	isDevelopingAddon: () => true,

	config(env, baseConfig) {
		const workboxOptions = baseConfig.workbox || {};
		const options = baseConfig['ember-cli-workbox'] || {};
		const projectName = baseConfig.APP && baseConfig.APP.name || 'app';

		mergeOptions(workboxOptions, {
			swDest: 'sw.js',
			globDirectory: './',
			globPatterns: ['**/*.{json,css,js,png,svg,eot,ttf,woff,jpg,gif,ico,xml,html,txt}'],
			skipWaiting: false,
			clientsClaim: false,
			cacheId: projectName
		});

		env = env || process.env.EMBER_ENV;

		// Do nothing if no ENV. For example, when running an ember generator.
		if (!env) {
			return;
		}

		const isProdBuild = Boolean(env.match('prod'));

		mergeOptions(options, {
			enabled: isProdBuild,
			debug: !isProdBuild
		});

		this.options = options;
		this.workboxOptions = workboxOptions;
	},

	postprocessTree(type, tree) {
		if (type !== 'all') {
			return tree;
		}

		const workboxFunnel = new BroccoliWorkbox([tree], {
			options: this.options,
			workboxOptions: this.workboxOptions
		});

		return mergeTrees([tree, workboxFunnel], {
			overwrite: true
		});
	},

	treeForPublic(tree) {
		const assetsTree = new Funnel('public');

		return mergeTrees([tree, assetsTree], {
			overwrite: true
		});
	}

};
