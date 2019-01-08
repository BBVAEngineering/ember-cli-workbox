import { module, test } from 'qunit';

import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | Simple Acceptance Test', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
      this.events = [];
      this.swService = this.application.__container__.lookup('service:service-worker');
      // Prevent running initializer
      this.swService.set('isSupported', false);

      this.swService.on('registrationComplete', () =>	this.events.push('registrationComplete'));
      this.swService.on('unregistrationComplete', () => this.events.push('unregistrationComplete'));
      this.swService.on('registrationError', () => this.events.push('registrationError'));
      // this.swService.on('newSWwaiting', () => this.events.push('newSWwaiting'));
      // this.swService.on('newSWActive', () => this.events.push('newSWActive'));
  });

  hooks.afterEach(function() {
      return this.swService.unregisterAll();
  });

  test('its registration is rejected if sw file does not exist', function(assert) {
      return this.swService.register('foo').catch((error) => {
          assert.ok(error, 'Service worker triggers "registrationError" event');
          assert.deepEqual(this.events, ['registrationError']);
      });
  });

  test('its registration is resolved if file exist', function(assert) {
      return this.swService.register('/sw.js').then(() => {
          assert.deepEqual(this.events, ['registrationComplete'], 'Event triggered: registrationComplete');

          return window.navigator.serviceWorker.getRegistrations();
      }).then((registrations) => {
          assert.ok(registrations.length);
      });
  });

  test('it unregisters sw', function(assert) {
      return this.swService.register('/sw.js').then(() => {
          assert.deepEqual(this.events, ['registrationComplete'], 'Event triggered: registrationComplete');

          return this.swService.unregisterAll();
      }).then(() => {
          assert.deepEqual(this.events, ['registrationComplete', 'unregistrationComplete'], 'Service worker does not exists');

          return window.navigator.serviceWorker.getRegistrations();
      }).then((registrations) => {
          assert.notOk(registrations.length);
      });
  });
});

