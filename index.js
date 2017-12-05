/* eslint-disable no-sync */
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const workboxBuild = require('workbox-build');
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

		mergeOptions(workboxOptions, {
			swDest: 'sw.js',
			globDirectory: './',
			globPatterns: ['**/*.{json,css,js,png,svg,eot,ttf,woff,jpg,gif,ico,xml,html,txt}'],
			navigateFallback: '/index.html',
			templatedUrls: {},
			manifestTransforms: [],
			skipWaiting: true,
			clientsClaim: true,
			cacheId: baseConfig.APP.name
		});

		mergeOptions(options, {
			enabled: env === 'prod'
		});

		this.options = options;
		this.workboxOptions = workboxOptions;
	},

	postBuild({ directory }) {
		const options = Object.assign({}, this.workboxOptions);

		if (!this.options.enabled) {
			debug(yellow('Skipping service worker generation on local build...'));
			return null;
		}

		options.globDirectory = directory + path.sep + options.globDirectory;
		options.swDest = directory + path.sep + options.swDest;

		return workboxBuild.generateSW(options).then(() => {
			debug(blue('Service worker successfully generated.'));
		}).catch((e) => {
			debug(red(`Could not generate service Worker ${e.name}`));

			throw Error(e);
		});
	}

};
