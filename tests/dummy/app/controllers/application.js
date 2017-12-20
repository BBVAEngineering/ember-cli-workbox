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
		const states = this.get('states');

		sw.on('newSWwaiting', (reg) => {
			sw.forceActivate(reg);
			states.pushObject('newSWwaiting');
		});
		sw.on('newSWActive', () => {
			states.pushObject('newSWActive');
		});
	},

	states: []
});
