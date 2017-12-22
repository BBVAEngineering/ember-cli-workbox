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

	states: [],

	/**
	 * Subscribe to session events
	 *
	 * @method subscribeToSWEvents
	 */
	subscribeToSWEvents() {
		const sw = this.get('serviceWorker');
		const states = this.get('states');

		sw.on('registrationComplete', () => {
			this.set('states', states.push('registrationComplete'));
		});
		sw.on('newSWwaiting', (reg) => {
			sw.forceActivate(reg);
			this.set('states', states.push('newSWwaiting'));
		});
		sw.on('newSWActive', () => {
			this.set('states', states.push('newSWActive'));
		});
	}
});
