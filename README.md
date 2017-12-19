ember-cli-workbox [![Build Status](https://travis-ci.org/BBVAEngineering/ember-cli-workbox.svg?branch=master)](https://travis-ci.org/BBVAEngineering/ember-cli-workbox) [![GitHub version](https://badge.fury.io/gh/BBVAEngineering%2Fember-cli-workbox.svg)](https://badge.fury.io/gh/BBVAEngineering%2Fember-cli-workbox) [![Dependency Status](https://travis-ci.org/BBVAEngineering/ember-cli-workbox.svg)](https://travis-ci.org/BBVAEngineering/ember-cli-workbox)
=================

A plugin for your Ember-cli build process, giving your app offline caching as a progressive enhancement, using service workers. Ember-cli-workbox will add a service worker to your Ember App registering it on initial page load.

This addon simplify service worker registration and caching, powered by [workbox-build](https://www.npmjs.com/package/workbox-build). Workbox library automate precaching of static resources (HTML, JavaScript, CSS, and images) and handle runtime caching and fallback strategies. It allowed us to implement a performant strategy in which a static content is always served directly from the cache, and dynamic or remote resources are served from the network, with fallbacks to cached or static responses when needed.

For more details on Workbox check out:
* [Workbox Google Developers](https://developers.google.com/web/tools/workbox/)
* [Service Workers cookbook](https://serviceworke.rs/)

### Installation

`ember install ember-cli-workbox`

### Configuration

If you need to customize **ember-cli-workbox configuration** you can do it like this:

```JavaScript
//app/config/environment.js

ENV['ember-cli-workbox'] = {
  enabled: environment !== 'test',
  debug
};
```
* **enabled** - (Boolean) Addon is enabled. Default to true on production builds
* **debug** - (Boolean) Log serviceworker states (registering, updating, etc)

You can further customize ember-cli-workbox by setting **workbox configurations** in your environment.js file:

```JavaScript
//app/config/environment.js

ENV['workbox'] = {
  globPatterns: ['**\/*.{html,js,css}'],
  globDirectory: './',
  globIgnores: [],
  ...
};
```

* **swDest** - (String) The path to the final service worker file that will be created by the build process, relative to the build directory. Default path: './sw.js'
* **globPatterns** - (Array of String) Files matching against any of these glob patterns will be included in the precache manifest. By default sw precaches all our ember application assets that match '**/*.{json,css,js,png,svg,eot,ttf,woff,jpg,gif,ico,xml,html,txt}'
* **globDirectory** - (String) The base directory you wish to match globPatterns against, related to the build directory. Default  './'
* **globIgnores** - (String or Array of String) Files matching against any of these glob patterns will be excluded from the file manifest, overriding any matches from globPatterns.
E.g. globIgnores: ['**\/ignored.html']
* **templatedUrls** - (Object with Array or String properties) If a URL is rendered generated based on some server-side logic, its contents may depend on multiple files or on some other unique string value.
* **cacheId** - (String) An optional ID to be prepended to caches used by workbox-sw. This is primarily useful for local development where multiple sites may be served from the same http://localhost origin. Defaults to your app name (config.APP.name).
* **runtimeCaching** - (Array of Object) Passing in an array of objects containing urlPatterns, handlers, and potentially options that will add the appropriate code to the generated service worker to handle runtime caching. The handler values correspond the names of the [strategies](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-sw.Strategies) supported by workbox-sw (cacheFirst, cacheOnly, networkFirst, networkOnly, staleWhileRevalidate)
```JavaScript
runtimeCaching: [{
  // You can use a RegExp as the pattern:
  urlPattern: /https://api.example.com/,
  handler: 'cacheFirst',
  // Any options provided will be used when
  // creating the caching strategy.
  options: {
    cacheName: 'my-api-cache',
    cacheExpiration: {
      maxEntries: 10,
    },
  },
},
 ...
]
```
* **maximumFileSizeToCacheInBytes** - (number) This value can be used to determine the maximum size of files that will be precached

> For more details on Workbox configuration take a look at: [Workbox Google Developers](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build)

### Subscribing to events

ServiceWorkerService triggers the following events:

  - `registrationComplete`: sw successfully registered
  - `registrationError`: sw not registered
  - `newSWActive`: new sw controlling page
  - `newSWWaiting`: new sw waiting for controlling page
  - `unregistrationComplete`: all sw are unregistered

**Why and how to use this events?**

By default, users have to close all tabs to a site in order to update a Service Worker. The Refresh button is not enough.
If you make a mistake here, users will see an outdated version of your site even after refreshing
Service Workers break the Refresh button because they behave like “apps,” refusing to update while the app is still running, in order to maintain code consistency and client-side data consistency. We can write code to notify users when a new version is available. 

This addon make it easy for you and implements [google recommendation](https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users).
Basically, what you have to do is subscribing to the event `newSWWaiting`. When event is triggered, send a message to sw in order to launch `skipWaiting + clients.claim` on it to turn it active (you can do this just calling forceActivate method on serviceWorkerService). When service worker became active it will send a message "reload-window" and "newSWActive" will be triggered.

**Example of the event**

See this complete example for this implementation:

```JavaScript

// <my-app>/mixins/service-worker-states.js
   
import Ember from 'ember';

const { 
  inject: { service },
  Mixin
} = Ember;

/**
 * The mixin for the application route to control service worker states
 *
 * @class ApplicationServiceWorkerMixin
 * @extends Ember.Mixin
 */
export default Mixin.create({

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
  		if (window.confirm('New version available! OK to refresh?')) {
  			sw.forceActivate(reg);
  		}
  	});
  	sw.on('newSWActive', () => {
  		window.location.reload();
  		console.log('New version installed');
  	});
  }  
});

// <my-app>/routes/application.js

import ApplicationSwMixin from '<my-app>/mixins/service-worker-states';

export default Route.extend(ApplicationSwMixin,{
  ....
} 

```

### Debugging serviceWorker generation on build

```
$ DEBUG=ember-cli:workbox ember s
```


### Future improvements

Ember-cli-workbox currently do not implement workboxBuild.injectManifest() feature, only works generating a new serviceworker.

What is injectManifest feature?

If you have an existing serviceWorker, workbox-build can modify it to inject the manifest file to precache our static files.
Basically you should have a placeholder array which is populated automatically by workboxBuild.injectManifest()

```JavaScript
// my existing service worker
workboxSW.precache([]);
```

Sometimes you'll need more control over what is cached, strategies used and custom code inside the server worker. You can do this by setting your own service worker and using the WorkboxSW object directly.

### Contributing

We're thankful to the community for contributing any improvements.
