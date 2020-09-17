
self.addEventListener('message', ({ data }) => {
	if (data === 'force-activate') {
		self.skipWaiting();

		try {
			// `claim` can fail when SW is deactivated due to some lifespan events.
			self.clients.claim();
		} catch (e) {
			// noop.
		}

		self.clients.matchAll().then((clients) => {
			clients.forEach((client) => client.postMessage('reload-window'));
		});
	}
});
