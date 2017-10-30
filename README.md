# ember-cli-workbox

## Config

```javascript
// config/environment.js
return {
  workbox: {
    enabled: environment === 'production',
    swFile: './assets/service-workers/sw.js',
    globPatterns: ['**\/*.{html,js,css}'],
    globDirectory: './',
    globIgnores: []
  }
};
```
