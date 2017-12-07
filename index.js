/* eslint-disable no-sync */
const path = require('path');
const chalk = require('chalk');
const workboxBuild = require('workbox-build-v2-with-follow');
const debug = require('debug')('ember-cli:workbox');
const { red, blue, yellow } = chalk;

function mergeOptions(options, defaultOptions) {
	for (const option in defaultOptions) {
		if (!options.hasOwnProperty(option)) {
			options[option] = defaultOptions[option];
		}
	}

	return options;
}

module.exports = {
	name: 'ember-cli-workbox',

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

		mergeOptions(options, {
			enabled: env === 'prod'
		});

		this.options = options;
		this.workboxOptions = workboxOptions;
	},

	postBuild({ directory }) {
		const workboxOptions = Object.assign({}, this.workboxOptions);

		if (!this.options.enabled) {
			debug(yellow('Addon disabled. Generating empty service worker...'));
			workboxOptions.globPatterns = [];
			workboxOptions.runtimeCaching = [];
		}

		workboxOptions.globDirectory = directory + path.sep + workboxOptions.globDirectory;
		workboxOptions.swDest = directory + path.sep + workboxOptions.swDest;

		return workboxBuild.generateSW(workboxOptions).then(() => {
			debug(blue('Service worker successfully generated.'));
		}).catch((e) => {
			debug(red(`Could not generate service Worker ${e.name}`));

			throw Error(e);
		});
	}

};
