var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf').sync;
var exec = require('child_process').exec;

var emberCLIPath = path.resolve(__dirname, './fixtures/simple-app/node_modules/ember-cli/bin/ember');
var fixturePath = path.resolve(__dirname, './fixtures/simple-app');

describe('Addon is enabled for production build', function () {
	this.timeout(120000);

	context('Precaches and register serviceworker', () => {

		before(() => runEmberCommand(fixturePath, 'build --prod'));

		after(() => cleanup(fixturePath));

		it('produces a sw.js file', () => {
			exists(outputFilePath('sw.js'));
		});

		it('precaches assets', () => {
			contains(outputFilePath('sw.js'), /assets\/simple-app-\w\.js/);
		});

		it('produces a sw skip waiting file, which is imported on sw.js', () => {
			exists(outputFilePath('assets/service-workers/skip-waiting.js'));
			contains(outputFilePath('sw.js'), /skip-waiting\.js/);
		});
	});
});


describe('Addon is disabled for development', function () {
	this.timeout(120000);

	context('Precaches nothing and register serviceworker', () => {

		before(() => runEmberCommand(fixturePath, 'build'));

		after(() => cleanup(fixturePath));

		it('produces a sw.js file', () => {
			exists(outputFilePath('sw.js'));
		});

		it('precaches nothing', () => {
			contains(outputFilePath('sw.js'), /precacheManifest\s\=\s\[\]/);
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

function exists(filePath) {
	assert.ok(fs.existsSync(filePath), filePath + ' exists');
}

function contains(filePath, regexp) {
	var fileContent = fs.readFileSync(filePath, 'utf8');

	console.log(fileContent);
	console.log(fileContent.match(regexp));

	assert.ok(fileContent.match(regexp), filePath + ' contains ' + regexp);
}
