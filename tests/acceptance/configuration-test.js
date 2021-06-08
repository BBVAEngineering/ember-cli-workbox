import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | Simple Acceptance Test', (hooks) => {
	setupApplicationTest(hooks);

	test('"workbox" configuration is not in environment config', async function(assert) {
		const config = this.owner.resolveRegistration('config:environment');

		assert.notOk(config.workbox);
	});

	test('"workbox" configuration is setted in "ember-cli-workbox" config object', async function(assert) {
		const config = this.owner.resolveRegistration('config:environment');

		assert.equal(config['ember-cli-workbox'].swDest, 'sw.js');
	});
});

