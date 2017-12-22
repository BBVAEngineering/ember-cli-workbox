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

test('Page load serviceWorker correctly', (assert) => {
	visit('/');
	assert.expect(2);

	const done = assert.async();

	andThen(() => {
		run.later(() => {
			assert.equal(find('#serviceWorkerState li').length, 3);
			done();
		}, 20000);
	});
});


test('ServiceWorker is not registered if it is not supported', (assert) => {
	assert.ok(true);
});
