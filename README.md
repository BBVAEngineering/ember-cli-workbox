ember-cli-workbox
=================

Service worker generator with precaching and some basic configurable options using [workbox-build](https://www.npmjs.com/package/workbox-build).

For more details on Workbox check out:
* [Workbox Google Developers](https://developers.google.com/web/tools/workbox/)

Usage for Ember Cli
-------------------

`ember install ember-cli-workbox`

### Configuration
By default the service worker will be generated for production builds and the service worker will be registered on an initializer.
You can further customize ember-cli-workbox by setting configurations in your environment.js file:

```JavaScript
//app/config/environment.js

ENV.workbox = {
  enabled: true,
  globPatterns: ['**\/*.{html,js,css}'],
  globDirectory: './',
  globIgnores: []
};
```

You have the same config properties available as workbox:

* **enabled** - (Boolean) Generate service worker. Defaults to true in production.
* **swFile** - (String) The path to the final service worker file that will be created by the build process, relative to the current working directory. Default path: './assets/service-workers/sw.js'
* **globPatterns** - (Array of String) Files matching against any of these glob patterns will be included in the precache manifest. By default sw precaches all our ember application assets that match '**\/*.{js,css,html}'
* **globDirectory** - (String) The base directory you wish to match globPatterns against, related to the current working directory. Default  './'
* **globIgnores** - (String or Array of String) Files matching against any of these glob patterns will be excluded from the file manifest, overriding any matches from globPatterns.
E.g. globIgnores: ['**\/ignored.html']
* **templatedUrls** -- (Object with Array or String properties) If a URL is rendered generated based on some server-side logic, its contents may depend on multiple files or on some other unique string value.
* **cacheId** -- (String) An optional ID to be prepended to caches used by workbox-sw. This is primarily useful for local development where multiple sites may be served from the same http://localhost origin..

For more details on Workbox configuration take a look at:
* [Workbox Google Developers](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build)
