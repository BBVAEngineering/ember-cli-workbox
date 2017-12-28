import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import Ember from 'ember';


const { run } = Ember;
let serviceWorkerService;

moduleForAcceptance('Acceptance | Simple Acceptance Test', {
	beforeEach() {
		serviceWorkerService = this.application.__container__.lookup('service:service-worker');

		// serviceWorkerService.unregisterAll();
	}
});

test('SW captures registration errors', (assert) => {
	visit('/');

	const done = assert.async();

	serviceWorkerService.on('registrationError', (error) => {
		assert.ok(error, 'Service worker triggers "registrationError" event');
		done();
	});
});

// test('Page load serviceWorker correctly', (assert) => {
// 	visit('/');
// 	assert.expect(2);

// 	const done = assert.async();

// 	serviceWorkerService.on('registrationComplete', () => {
// 		assert.ok(window.navigator.serviceWorker.controller, 'Service worker exists');
// 		done();
// 	});

// 	andThen(() => {
// 		// run.later(() => {
// 			// assert.ok(window.navigator.serviceWorker.controller, 'Service worker exists');
// 			// done();
// 		// }, 20000);
// 	});
// });


// test('ServiceWorker is not registered if it is not supported', (assert) => {
// 	assert.ok(true);
// });
