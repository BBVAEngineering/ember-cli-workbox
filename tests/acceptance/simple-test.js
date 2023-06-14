import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import sinon from 'sinon';

module('Acceptance | Simple Acceptance Test', (hooks) => {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    this.events = [];
    this.swService = this.owner.lookup('service:service-worker');
    // Prevent running initializer
    this.swService.set('isSupported', false);

    this.swService.on('registrationComplete', () =>
      this.events.push('registrationComplete')
    );
    this.swService.on('unregistrationComplete', () =>
      this.events.push('unregistrationComplete')
    );
    this.swService.on('error', () => this.events.push('error'));
    // this.swService.on('newSWwaiting', () => this.events.push('newSWwaiting'));
    // this.swService.on('newSWActive', () => this.events.push('newSWActive'));
  });

  hooks.afterEach(async function () {
    await this.swService.unregisterAll();
  });

  test('its registration is rejected if sw file does not exist', async function (assert) {
    assert.expect(2);

    try {
      await this.swService.register('foo');
    } catch (error) {
      assert.ok(error, 'Service worker triggers "error" event');
      assert.deepEqual(this.events, ['error']);
    }
  });

  test('its registration is resolved if file exist', async function (assert) {
    await this.swService.register('sw.js');

    assert.deepEqual(
      this.events,
      ['registrationComplete'],
      'Event triggered: registrationComplete'
    );

    const registrations =
      await window.navigator.serviceWorker.getRegistrations();

    assert.ok(registrations.length);
  });

  test('it unregisters sw', async function (assert) {
    await this.swService.register('sw.js');

    assert.deepEqual(
      this.events,
      ['registrationComplete'],
      'Event triggered: registrationComplete'
    );

    await this.swService.unregisterAll();

    assert.deepEqual(
      this.events,
      ['registrationComplete', 'unregistrationComplete'],
      'Service worker does not exists'
    );

    const registrations =
      await window.navigator.serviceWorker.getRegistrations();

    assert.notOk(registrations.length);
  });

  test('it unregisters sw but fails', async function (assert) {
    await this.swService.register('sw.js');

    const registrations = await this.swService.sw.getRegistrations();
    const stubs = registrations.map((reg) => {
      return sinon.stub(reg, 'unregister').callsFake(() => {
        return Promise.resolve(false);
      });
    });

    const stubLog = sinon.stub(this.swService, '_log');

    assert.deepEqual(
      this.events,
      ['registrationComplete'],
      'Event triggered: registrationComplete'
    );

    await this.swService.unregisterAll();

    assert.ok(stubLog.called);
    assert.ok(registrations.length);

    assert.deepEqual(
      this.events,
      ['registrationComplete', 'unregistrationComplete'],
      'Service worker does not exists'
    );

    stubs.forEach((stubReg) => stubReg.restore());
    stubLog.restore();
  });

  test.skip('it triggers "update" event on sw response', async function (assert) {
    const _reload = window.location.reload;
    let called = 0;

    Object.defineProperty(window.location, 'reload', {
      value() {
        called++;
      },
    });

    await this.swService._watchUpdates();

    const event = new Event('message');

    event.data = 'reload-window';

    this.swService.sw.dispatchEvent(event);

    assert.equal(called, 1, 'window.location.reload() called once');

    window.location.reload = _reload; // eslint-disable-line require-atomic-updates
  });
});
