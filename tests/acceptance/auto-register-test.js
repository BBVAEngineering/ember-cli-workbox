import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { set } from '@ember/object';
import swInitializer from 'dummy/instance-initializers/sw';

module('Acceptance | Auto register', (hooks) => {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    this.events = [];
    this.swService = this.owner.lookup('service:service-worker');
  });

  hooks.afterEach(async function () {
    await this.swService.unregisterAll();
  });

  test('its registration is made automatically', async function (assert) {
    swInitializer.initialize(this.owner);

    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });

    await promise;
    await visit('/');

    const registrations =
      await window.navigator.serviceWorker.getRegistrations();

    assert.ok(registrations.length);
  });

  test('its registration can be disabled', async function (assert) {
    const config = this.owner.resolveRegistration('config:environment');

    set(config, 'ember-cli-workbox.autoRegister', false);

    this.swService.set('autoRegister', false);

    swInitializer.initialize(this.owner);

    await visit('/');

    const registrations =
      await window.navigator.serviceWorker.getRegistrations();

    assert.notOk(registrations.length, 'there is no registrations');
  });
});
