
self.addEventListener('message', (event) => {
	if (!event.data) {
		return;
	}

	switch (event.data) {
		case 'force-activate':
			self.skipWaiting();
			self.clients.claim();
			self.clients.matchAll().then((clients) => {
				clients.forEach((client) => client.postMessage('reload-window'));
			});
			break;
		default:
		// NOOP
			break;
	}
});
