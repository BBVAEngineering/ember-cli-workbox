import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { set } from '@ember/object';
import swInitializer from 'dummy/instance-initializers/sw';

module('Acceptance | Auto Register Acceptance Test', (hooks) => {
	setupApplicationTest(hooks);

	hooks.beforeEach(function() {
		this.events = [];
		this.swService = this.owner.lookup('service:service-worker');
	});

	hooks.afterEach(function() {
		return this.swService.unregisterAll();
	});

	test('its registration is made automatically', function(assert) {
		swInitializer.initialize(this.owner);

		return visit('/').then(
			() => window.navigator.serviceWorker.getRegistrations()
		).then((registrations) => {
			assert.ok(registrations.length);
		});
	});

	test('its registration can be disabled', function(assert) {
		const config = this.owner.resolveRegistration('config:environment');

		set(config, 'ember-cli-workbox.autoRegister', false);

		this.swService.set('autoRegister', false);

		swInitializer.initialize(this.owner);

		return visit('/').then(
			() => window.navigator.serviceWorker.getRegistrations()
		).then((registrations) => {
			assert.notOk(registrations.length, 'there is no registrations');
		});
	});
});
