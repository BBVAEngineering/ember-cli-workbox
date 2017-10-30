/* eslint-disable no-sync */
const fs = require('fs');
const path = require('path');
const workboxBuild = require('workbox-build');

module.exports = {
	name: 'ember-cli-workbox',

	config(env, baseConfig) {
		const options = baseConfig.workbox || {};
		const defaultOptions = {
			enabled: env === 'production',
			swFile: './assets/service-workers/sw.js',
			globPatterns: ['**\/*.{html,js,css}'],
			globDirectory: './',
			globIgnores: [],
			templatedUrls: {},
			manifestTransforms: []
		};

		for (const option in defaultOptions) {
			if (!options.hasOwnProperty(option)) {
				options[option] = defaultOptions[option];
			}
		}

		const relativePath = path.relative(options.swFile, './');

		options.manifestTransforms.push((entries) => entries.map((entry) => {
			entry.url = `${relativePath}/${entry.url}`;

			return entry;
		}));

		this.workboxOptions = options;
	},

	postBuild({ directory }) {
		const options = Object.assign({}, this.workboxOptions);

		if (!options.enabled) {
			return null;
		}

		options.globDirectory = directory + path.sep + options.globDirectory;
		options.swDest = directory + path.sep + options.swFile;

		delete options.swFile;

		if (fs.existsSync(options.swDest)) {
			options.swSrc = options.swDest;

			return workboxBuild.injectManifest(options);
		}

		return workboxBuild.generateSW(options);
	}

};
