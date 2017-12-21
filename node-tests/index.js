const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf').sync;
const exec = require('child_process').exec;

const TEST_TIMEOUT = 120000;
const emberCLIPath = path.resolve(__dirname, './fixtures/simple-app/node_modules/ember-cli/bin/ember');
const fixturePath = path.resolve(__dirname, './fixtures/simple-app');
const outputSWPath = outputFilePath('sw.js');

describe('Addon is enabled for production build', function() {
	this.timeout(TEST_TIMEOUT);

	context('Precaches and register serviceworker', () => {
		before(() => runEmberCommand(fixturePath, 'build --prod'));

		after(() => cleanup(fixturePath));

		it('produces a sw.js file', () => {
			existFile(outputSWPath);
		});

		it('precaches assets', () => {
			contains(outputFilePath('sw.js'), /assets\/service-workers\/skip-waiting.js/);
			contains(outputFilePath('sw.js'), /assets\/simple-app\.[css|js]/);
			contains(outputFilePath('sw.js'), /vendor\.[css|js]/);
			contains(outputFilePath('sw.js'), /crossdomain\.xml/);
			contains(outputFilePath('sw.js'), /index\.html/);
			contains(outputFilePath('sw.js'), /robots\.txt/);
		});

		it('produces a sw skip waiting file, which is imported on sw.js', () => {
			existFile(outputFilePath('assets/service-workers/skip-waiting.js'));
			contains(outputSWPath, /"assets\/service-workers\/skip-waiting.js"/);
		});
	});
});


describe('Addon is disabled for development', function() {
	this.timeout(TEST_TIMEOUT);

	context('Precaches nothing and register serviceworker', () => {
		before(() => runEmberCommand(fixturePath, 'build'));

		after(() => cleanup(fixturePath));

		it('produces a sw.js file', () => {
			existFile(outputSWPath);
		});

		it('precaches nothing', () => {
			contains(outputSWPath, /precacheManifest\s\=\s\[\]/);
		});
	});
});

function runEmberCommand(packagePath, command) {
	return new Promise((resolve, reject) =>
		exec(`${emberCLIPath} ${command}`, {
			cwd: packagePath
		}, (err, result) => {
			if (err) {
				reject(err);
			}
			resolve(result);
		})
	);
}

function cleanup(packagePath) {
	rimraf(path.join(packagePath, 'dist'));
	rimraf(path.join(packagePath, 'tmp'));
}

function outputFilePath(file) {
	return path.join(fixturePath, 'dist', file);
}

function existFile(filePath) {
	assert.ok(fs.existsSync(filePath), filePath + ' exists');
}

function contains(filePath, regexp) {
	const fileContent = fs.readFileSync(filePath, 'utf8');

	assert.ok(fileContent.match(regexp), `${filePath} contains ${regexp}`);
}
