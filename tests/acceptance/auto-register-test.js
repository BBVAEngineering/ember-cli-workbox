import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { set } from '@ember/object';

module('Acceptance | Auto Register Acceptance Test', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
      this.events = [];
      this.swService = this.application.__container__.lookup('service:service-worker');
  });

  hooks.afterEach(function() {
      return this.swService.unregisterAll();
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
});
