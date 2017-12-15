/* eslint-disable no-sync */
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const prettyBytes = require('pretty-bytes');
const workboxBuild = require('workbox-build');
const workboxBuildPkg = require('workbox-build/package.json');
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

function removeDir(dir) {
	if (fs.existsSync(dir)) {
		fs.readdirSync(dir).forEach((file) => {
			const curPath = dir + path.sep + file;

			if (fs.lstatSync(curPath).isDirectory()) {
				removeDir(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});

		fs.rmdirSync(dir);
	}
}

module.exports = {
	name: 'ember-cli-workbox',

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
			clientsClaim: true,
			importWorkboxFromCDN: false,
			cacheId: projectName,
			importScripts: ['assets/service-workers/skip-waiting.js']
		});

		const isProdBuild = env === 'prod';

		mergeOptions(options, {
			enabled: isProdBuild,
			debug: !isProdBuild
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

		workboxOptions.globDirectory = `${directory}${path.sep}${workboxOptions.globDirectory}`;
		workboxOptions.swDest = `${directory}${path.sep}${workboxOptions.swDest}`;

		const workboxDirectory = `${directory}${path.sep}workbox-v${workboxBuildPkg.version}`;

		// Remove workbox libraries directory to prevent exception on recopying it.
		if (!workboxOptions.importWorkboxFromCDN && fs.existsSync(workboxDirectory)) {
			removeDir(workboxDirectory);
		}

		return workboxBuild.generateSW(workboxOptions).then(({ count, size }) => {
			debug(blue('Service worker successfully generated.'));
			debug(blue(`${count} files will be precached, totalling ${prettyBytes(size)}.`));
		}).catch((e) => {
			debug(red(`Could not generate service Worker ${e.name}`));

			throw Error(e);
		});
	},

	treeForPublic(tree) {
		const assetsTree = new Funnel('public');

		return mergeTrees([tree, assetsTree], {
			overwrite: true
		});
	}

};
