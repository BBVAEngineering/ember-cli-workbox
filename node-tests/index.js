/* eslint-disable no-sync */
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf').sync;
const exec = require('child_process').exec;

const TEST_TIMEOUT = 120000;
const MOCK_CONFIG = path.resolve(__dirname, 'default-config.js');
const MOCK_BUILD_CONFIG = path.resolve(__dirname, 'default-ember-cli-build.js');
const emberCLIPath = path.resolve(
  __dirname,
  '../node_modules/ember-cli/bin/ember'
);
const fixturePath = path.resolve(__dirname, '..');
const outputSWPath = outputFilePath('sw.js');
const configPath = path.resolve(fixturePath, 'tests/dummy/config');

// Using process.env to be accessible independent of file location
process.env.IMPORT_SCRIPTS_PREFIX = '2d57274b-581a-4017-9b88-7f0f04b2d1a1';

function runEmberCommand(packagePath, command) {
  return new Promise((resolve, reject) =>
    exec(
      `${emberCLIPath} ${command}`,
      {
        cwd: packagePath,
      },
      (err, result) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      }
    )
  );
}

function cleanup(packagePath) {
  rimraf(path.join(packagePath, 'dist'));
  rimraf(path.join(packagePath, 'tmp'));
}

function outputFilePath(file) {
  return path.join(fixturePath, 'dist', file);
}

function assertFileExists(filePath) {
  assert.ok(fs.existsSync(filePath), `${filePath} exists`);
}

function assertFileDoesNotExist(filePath) {
  assert.isNotOk(fs.existsSync(filePath), `${filePath} does not exist`);
}

function assertContains(filePath, regexp) {
  const fileContent = fs.readFileSync(filePath, 'utf8');

  assert.ok(fileContent.match(regexp), `${filePath} contains ${regexp}`);
}

function mockConfig() {
  // config enviroment
  fs.renameSync(
    path.resolve(configPath, 'environment.js'),
    path.resolve(configPath, 'tmp.js')
  );
  fs.renameSync(MOCK_CONFIG, path.resolve(configPath, 'environment.js'));

  // ember cli build
  fs.renameSync(
    path.resolve(fixturePath, 'ember-cli-build.js'),
    path.resolve(fixturePath, 'tmp.js')
  );
  fs.renameSync(
    MOCK_BUILD_CONFIG,
    path.resolve(fixturePath, 'ember-cli-build.js')
  );
}

function restoreConfig() {
  // config enviroment
  fs.renameSync(path.resolve(configPath, 'environment.js'), MOCK_CONFIG);
  fs.renameSync(
    path.resolve(configPath, 'tmp.js'),
    path.resolve(configPath, 'environment.js')
  );

  // ember cli build
  fs.renameSync(
    path.resolve(fixturePath, 'ember-cli-build.js'),
    MOCK_BUILD_CONFIG
  );
  fs.renameSync(
    path.resolve(fixturePath, 'tmp.js'),
    path.resolve(fixturePath, 'ember-cli-build.js')
  );
}

describe('Addon is enabled for production build', function () {
  this.timeout(TEST_TIMEOUT);

  context('Precaches and register serviceworker', () => {
    before(async () => {
      mockConfig();

      await runEmberCommand(fixturePath, 'build --prod');
    });

    after(async () => {
      restoreConfig();

      await cleanup(fixturePath);
    });

    it('produces a sw.js file', () => {
      assertFileExists(outputSWPath);
    });

    it('precaches assets', () => {
      assertContains(
        outputFilePath('sw.js'),
        /engines-dist\/my-engine\/assets\/service-workers\/engine.js/
      );
      assertContains(
        outputFilePath('sw.js'),
        /assets\/service-workers\/skip-waiting.js/
      );
      assertContains(outputFilePath('sw.js'), /assets\/dummy\.[cjs|]/);
      assertContains(outputFilePath('sw.js'), /vendor\.[cjs|]/);
      assertContains(outputFilePath('sw.js'), /index\.html/);
      assertContains(outputFilePath('sw.js'), /robots\.txt/);
    });

    it('produces a sw skip waiting file, which is imported on sw.js', () => {
      assertFileExists(
        outputFilePath('assets/service-workers/skip-waiting.js')
      );
      assertContains(
        outputSWPath,
        /"assets\/service-workers\/skip-waiting.js"/
      );
    });

    it('produces a sw engine file, which is imported on sw.js', () => {
      assertFileExists(
        outputFilePath(
          'engines-dist/my-engine/assets/service-workers/engine.js'
        )
      );
      assertContains(
        outputSWPath,
        /"engines-dist\/my-engine\/assets\/service-workers\/engine.js"/
      );
    });

    it('applies importScriptsTransform', () => {
      assertContains(outputSWPath, process.env.IMPORT_SCRIPTS_PREFIX);
    });
  });
});

describe('Addon is disabled for development', function () {
  this.timeout(TEST_TIMEOUT);

  context('Precaches nothing and does not register serviceworker', () => {
    before(async () => {
      mockConfig();

      await runEmberCommand(fixturePath, 'build --prod');
      await runEmberCommand(fixturePath, 'build');
    });

    after(async () => {
      restoreConfig();

      await cleanup(fixturePath);
    });

    it('does not produce a sw.js file', () => {
      assertFileDoesNotExist(outputSWPath);
    });
  });

  context('Addon was enabled before and then disabled', () => {
    before(async () => {
      mockConfig();

      await runEmberCommand(fixturePath, 'build --prod');
    });

    after(async () => {
      restoreConfig();

      await cleanup(fixturePath);
    });

    it('removes sw.js file', async () => {
      assertFileExists(outputSWPath);

      await runEmberCommand(fixturePath, 'build');

      assertFileDoesNotExist(outputSWPath);
    });
  });
});
