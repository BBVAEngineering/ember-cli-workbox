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

// Create a subclass MyPlugin derived from Plugin
BroccoliWorkbox.prototype = Object.create(Plugin.prototype);
BroccoliWorkbox.prototype.constructor = BroccoliWorkbox;
function BroccoliWorkbox(inputNodes, config) {
	config = config || {};
	Plugin.call(this, inputNodes, {
		annotation: 'broccoli-workbox'
	});
	this.options = config.options;
	this.workboxOptions = config.workboxOptions;
}

BroccoliWorkbox.prototype.build = function() {
	const workboxOptions = Object.assign({}, this.workboxOptions);
	const directory = this.inputPaths[0];

	if (!this.options.enabled) {
		debug(yellow('Addon disabled. Generating empty service worker...'));
		workboxOptions.globPatterns = [];
		workboxOptions.runtimeCaching = [];
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

	return cleanPromise.then(() =>
		workboxBuild.generateSW(workboxOptions).then(({ count, size }) => {
			debug(blue('Service worker successfully generated.'));
			debug(blue(`${count} files will be precached, totalling ${prettyBytes(size)}.`));
		})
	).catch((e) => {
		debug(red(`Could not generate service Worker ${e.name}`));

		throw Error(e);
	});
};

module.exports = BroccoliWorkbox;
