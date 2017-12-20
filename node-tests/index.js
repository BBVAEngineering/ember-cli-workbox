var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf').sync;
var exec = require('child_process').exec;

var emberCLIPath = path.resolve(__dirname, './fixtures/simple-app/node_modules/ember-cli/bin/ember');
var fixturePath = path.resolve(__dirname, './fixtures/simple-app');

describe('Acceptance Tests', function () {
	this.timeout(120000);

	context('A Simple App', function () {


		before(function () {
			return runEmberCommand(fixturePath, 'build');
		});

		after(function () {
			cleanup(fixturePath);
		});

		it('produces a sw.js file', function () {
			exists(outputFilePath('sw.js'));
		});

		it('produces a sw skip waiting file, which is imported on sw.js', function () {
			exists(outputFilePath('assets/service-workers/skip-waiting.js'));
		contains(outputFilePath('sw.js'), /skip-waiting\.js/);
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

	assert.ok(fileContent.match(regexp), filePath + ' contains ' + regexp);
}
