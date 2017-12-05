/* eslint-disable no-sync */
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const workboxBuild = require('workbox-build');
const debug = require('debug')('ember-cli:workbox');
const { red, blue, gold } = chalk;

module.exports = {
	name: 'ember-cli-workbox',

	config(env, baseConfig) {
		const options = baseConfig.workbox || {};
		const defaultOptions = {
			enabled: env === 'production',
			globDirectory: './',
			globPatterns: ['**/*.{json,css,js,png,svg,eot,ttf,woff,jpg,gif,ico,xml,html,txt}'],
			swDest: 'sw.js',
			navigateFallback: '/index.html',
			templatedUrls: {},
			handleFetch: true,
			manifestTransforms: [],
			verbose: true,
			skipWaiting: true,
			clientsClaim: true,
			cacheId: baseConfig.APP.name
		};

		for (const option in defaultOptions) {
			if (!options.hasOwnProperty(option)) {
				options[option] = defaultOptions[option];
			}
		}

		this.workboxOptions = options;
	},

	postBuild({ directory }) {
		const options = Object.assign({}, this.workboxOptions);

		if (!options.enabled) {
			debug(gold('Skipping service worker generation on local build...'));
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
