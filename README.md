ember-cli-workbox
=================

Service worker generator with precaching and some basic configurable options using [workbox-build](https://www.npmjs.com/package/workbox-build).

For more details on Workbox check out:
* [Workbox Google Developers](https://developers.google.com/web/tools/workbox/)

Usage for Ember Cli
-------------------

`ember install ember-cli-workbox`

### Configuration
By default the service worker will be generated only for production builds and the service worker will be registered on an initializer.
If you need to customize **ember-cli-workbox configuration** you can do it like this:

```JavaScript
//app/config/environment.js

ENV['ember-cli-workbox'] = {
  enabled: environment !== 'test',
  debug
};
```
* **enabled** - (Boolean) Addon is enabled. Default to true on production builds
* **debug** - (Boolean) Log addon activity TBD

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
* **more** - For more details on Workbox configuration take a look at: [Workbox Google Developers](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build)

Subscribe to events:

TBW

```JavaScript
   

     serviceWorker: service(),
     
     _subscribeToSWEvents() {
        const sw = this.get('serviceWorker');

        sw.on('newWaiting', () => {
          window.alert('newWaiting');
        });
        sw.on('newActive', () => {
          window.alert('newActive');
        });

        sw.on('registrationComplete', () => window.alert('registrationComplete'));
	    }

 ...
]
```

### Debugging

 DEBUG=ember-cli:workbox
 TBW


### Improvements TBD

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
