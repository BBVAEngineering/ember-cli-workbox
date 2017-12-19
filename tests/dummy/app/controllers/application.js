import Ember from 'ember';

const { Controller, inject: { service } } = Ember;

export default Controller.extend({

	serviceWorker: service(),

	/**
	 * Mixin initialization
	 *
	 * @method init
	 */
	init() {
		this._super(...arguments);
		this.subscribeToSWEvents();
	},

	/**
	 * Subscribe to session events
	 *
	 * @method subscribeToSWEvents
	 */
	subscribeToSWEvents() {
		const sw = this.get('serviceWorker');

		sw.on('newSWwaiting', (reg) => {
			sw.forceActivate(reg);
		});
		sw.on('newSWActive', () => {
			this.set('ServiceWorker activated');
		});
	},

	text: 'Initial super text'
});
