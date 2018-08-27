import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import { set } from '@ember/object';

moduleForAcceptance('Acceptance | Auto Register Acceptance Test', {
	beforeEach() {
		this.events = [];
		this.swService = this.application.__container__.lookup('service:service-worker');
	},

	afterEach() {
		return this.swService.unregisterAll();
	}
});

test('its registration is made automatically', (assert) => {
	return visit('/').then(
		() => window.navigator.serviceWorker.getRegistrations()
	).then((registrations) => {
		assert.ok(registrations.length);
	});
});

test('its registration can be disabled', function(assert) {
	const config = this.application.resolveRegistration('config:environment');

	set(config, 'ember-cli-workbox.autoRegister', false);

	this.swService.set('autoRegister', false);

	return visit('/').then(
		() => window.navigator.serviceWorker.getRegistrations()
	).then((registrations) => {
		assert.notOk(registrations.length);
	});
});
