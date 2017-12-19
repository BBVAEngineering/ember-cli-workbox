import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { test } from 'qunit';

moduleForAcceptance('Acceptance | Simple Acceptance Test');

test('Page load serviceWorker correctly', (assert) => {
	visit('/');

	andThen(() => {
		assert.equal(find('#serviceWorkerState').text(), 'ServiceWorker activated');
	});
});
