self.addEventListener('message', ({ data }) => {
	if (data === 'force-activate') {
		self.skipWaiting();
		self.clients.claim();
		self.clients.matchAll().then((clients) => {
			clients.forEach((client) => client.postMessage('reload-window'));
		});
	}
});
