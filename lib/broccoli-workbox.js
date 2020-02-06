/* eslint-disable no-sync */
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const debug = require('debug')('ember-cli:workbox');
const Plugin = require('broccoli-plugin');
const prettyBytes = require('pretty-bytes');
const workboxBuild = require('workbox-build');
const workboxBuildPkg = require('workbox-build/package.json');
const rimraf = require('rimraf');
const chalk = require('chalk');
const { red, blue, yellow } = chalk;

function cleanDir(directory) {
	return new Promise((resolve, reject) =>
		rimraf(directory, (err, result) => {
			if (err) {
				reject(err);
			}
			resolve(result);
		})
	);
}

class BroccoliWorkbox extends Plugin {
	constructor(inputNodes, options = {}) {
		super(inputNodes, {
			annotation: options.annotation || 'broccoli-workbox',
			// see `options` in the below README to see a full list of constructor options
		});

		this.options = options.options;
		this.workboxOptions = options.workboxOptions;
	}

	_setDisabledOptions(workboxOptions) {
		debug(yellow('Addon disabled. Generating empty service worker...'));
		workboxOptions.globPatterns = [];
		workboxOptions.runtimeCaching = [];
	}

	async build() {
		const workboxOptions = Object.assign({}, this.workboxOptions);
		const directory = this.inputPaths[0];

		if (!this.options.enabled) {
			this._setDisabledOptions(workboxOptions);
		}

		workboxOptions.globDirectory = path.join(directory, workboxOptions.globDirectory);
		workboxOptions.swDest = path.join(directory, workboxOptions.swDest);

		let cleanPromise = Promise.resolve();
		const workboxDirectory = path.join(directory, `workbox-v${workboxBuildPkg.version}`);

		// Remove workbox libraries directory to prevent exception on recopying it.
		if (!workboxOptions.importWorkboxFromCDN && fs.existsSync(workboxDirectory)) {
			cleanPromise = cleanDir(workboxDirectory);
		}

		const filesToIncludeInSW = glob.sync('assets/service-workers/*.js',
			{ cwd: workboxOptions.globDirectory }
		);

		workboxOptions.importScripts = filesToIncludeInSW;

		try {
			await cleanPromise;

			const { count, size } = await workboxBuild.generateSW(workboxOptions);

			debug(blue('Service worker successfully generated.'));
			debug(blue(`${count} files will be precached, totalling ${prettyBytes(size)}.`));
		} catch (e) {
			debug(red(`Could not generate service Worker ${e.name}`));

			throw Error(e);
		}
	}
}

module.exports = BroccoliWorkbox;
