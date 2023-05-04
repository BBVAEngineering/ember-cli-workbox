/* eslint-disable no-undef */
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
const { red, green, yellow } = chalk;

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

  removeServiceWorker(filePath) {
    /* istanbul ignore else */
    if (fs.existsSync(filePath)) {
      debug(yellow('Addon disabled. Service worker exist, remove it'));
      fs.unlinkSync(filePath);
    }
  }

  async _generateSW(cleanPromise, workboxOptions) {
    try {
      await cleanPromise;

      const { count, size, warnings } = await workboxBuild.generateSW(
        workboxOptions
      );

      debug(green('Service worker successfully generated.'));
      debug(
        green(
          `${count} files will be precached, totalling ${prettyBytes(size)}.`
        )
      );

      /* istanbul ignore else */
      if (warnings) {
        debug(yellow(warnings));
      }
    } catch (e) {
      debug(red(`Could not generate service Worker ${e.name}`));

      throw Error(e);
    }
  }

  async build() {
    const workboxOptions = Object.assign({}, this.workboxOptions);
    const directory = this.inputPaths[0];

    workboxOptions.swDest = path.join(directory, workboxOptions.swDest);

    /* istanbul ignore else */
    if (!this.options.enabled) {
      debug(yellow('Addon disabled. Disable and remove service worker...'));

      this.removeServiceWorker(workboxOptions.swDest);

      return false;
    }

    workboxOptions.globDirectory = path.join(
      directory,
      workboxOptions.globDirectory
    );

    let cleanPromise = Promise.resolve();
    const workboxDirectory = path.join(
      directory,
      `workbox-v${workboxBuildPkg.version}`
    );

    // Remove workbox libraries directory to prevent exception on recopying it.
    /* istanbul ignore else */
    if (
      !workboxOptions.importWorkboxFromCDN &&
      fs.existsSync(workboxDirectory)
    ) {
      cleanPromise = cleanDir(workboxDirectory);
    }

    const filesToIncludeInSW = this.options.importScriptsGlobPatterns.reduce(
      (acc, pattern) => {
        const patterns = glob.sync(pattern, {
          cwd: workboxOptions.globDirectory,
        });

        return [...acc, ...patterns];
      },
      []
    );

    workboxOptions.importScripts = filesToIncludeInSW;
    /* istanbul ignore else */
    if (this.options.importScriptsTransform) {
      workboxOptions.importScripts = this.options.importScriptsTransform(
        workboxOptions.importScripts
      );
    }

    return this._generateSW(cleanPromise, workboxOptions);
  }
}

module.exports = BroccoliWorkbox;
