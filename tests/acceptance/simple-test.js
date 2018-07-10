import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import Ember from 'ember';

const { run } = Ember;

moduleForAcceptance('Acceptance | Simple Acceptance Test', {
	beforeEach() {
		this.events = [];
		this.swService = this.application.__container__.lookup('service:service-worker');
		// Prevent running initializer
		this.swService.set('isSupported', false);

		this.swService.on('registrationComplete', () =>	this.events.push('registrationComplete'));
		this.swService.on('unregistrationComplete', () =>	this.events.push('unregistrationComplete'));
		this.swService.on('registrationError', () =>	this.events.push('registrationError'));
		// this.swService.on('newSWwaiting', () => this.events.push('newSWwaiting'));
		// this.swService.on('newSWActive', () => this.events.push('newSWActive'));
	},

	afterEach() {
		return this.swService.unregisterAll();
	}
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

test('it purges caches', function(assert) {
	const _caches = this.swService.get('caches');

	return _caches.open('dummy').then(() =>
		this.swService.purgeCache()
	).then(() =>
		_caches.keys()
	).then((keys) => {
		assert.notOk(keys.length, 'Cache purged');
	});
});
