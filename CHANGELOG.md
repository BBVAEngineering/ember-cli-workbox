# [3.3.0](https://github.com/BBVAEngineering/ember-cli-workbox/compare/v3.2.0...v3.3.0) (2023-06-14)


### Features

* remove console log ([686ef73](https://github.com/BBVAEngineering/ember-cli-workbox/commit/686ef739297025a804429ed88e97798e7e4f8c54))

# [3.2.0](https://github.com/BBVAEngineering/ember-cli-workbox/compare/v3.1.2...v3.2.0) (2023-06-13)


### Features

* movemos el escenario ember-beta a experimentales ([d3459e8](https://github.com/BBVAEngineering/ember-cli-workbox/commit/d3459e87de44eb16617af6e4da893f84db0fee12))
* update workbox ([371c1bd](https://github.com/BBVAEngineering/ember-cli-workbox/commit/371c1bdcb2f60710819c79141b4f4920524bf47a))
* update workbox version ([2281419](https://github.com/BBVAEngineering/ember-cli-workbox/commit/2281419a001dae280be9f84d4484dab3bc1d9b5b))
* update workbox version ([de1974b](https://github.com/BBVAEngineering/ember-cli-workbox/commit/de1974b6a75be4f77c688ef820c7cd249d60630a))
* update yarn.lock ([19df250](https://github.com/BBVAEngineering/ember-cli-workbox/commit/19df2503f87dcddadd660f82594e389b40390640))

## [3.1.2](https://github.com/BBVAEngineering/ember-cli-workbox/compare/v3.1.1...v3.1.2) (2022-02-03)


### Bug Fixes

* remove public tree ([29e499c](https://github.com/BBVAEngineering/ember-cli-workbox/commit/29e499cf600bf20fc65d33be83c873bb4c52b365))
* upgrade dependencies ([59c207d](https://github.com/BBVAEngineering/ember-cli-workbox/commit/59c207d4a1d4e89bdc8167ea71391714936363c2))

## [3.1.1](https://github.com/BBVAEngineering/ember-cli-workbox/compare/v3.1.0...v3.1.1) (2022-02-02)


### Bug Fixes

* allow override default settings ([679ab32](https://github.com/BBVAEngineering/ember-cli-workbox/commit/679ab320ac87bd2ada286fd6c817613e55833e51)), closes [#108](https://github.com/BBVAEngineering/ember-cli-workbox/issues/108)

# [3.1.0](https://github.com/BBVAEngineering/ember-cli-workbox/compare/v3.0.0...v3.1.0) (2022-02-01)


### Features

* update to ember 4.1 ([35d6c01](https://github.com/BBVAEngineering/ember-cli-workbox/commit/35d6c011b24b8cce92fe5267ca9145761c9b3ee4)), closes [#106](https://github.com/BBVAEngineering/ember-cli-workbox/issues/106)

# [3.0.0](https://github.com/BBVAEngineering/ember-cli-workbox/compare/v2.0.0...v3.0.0) (2021-06-08)

### Features

- **config:** move workbox config from environment to ember-cli-build ([44f8fdf](https://github.com/BBVAEngineering/ember-cli-workbox/commit/44f8fdf433db6fad5e8ef125a017653bf8ca7fc8))

### BREAKING CHANGES

- **config:** workbox config has been moved to ember-cli-build.js

# [2.0.0](https://github.com/BBVAEngineering/ember-cli-workbox/compare/v1.2.0...v2.0.0) (2020-09-02)

### Bug Fixes

- fix pr issues ([ed60cb4](https://github.com/BBVAEngineering/ember-cli-workbox/commit/ed60cb4b9c577c0d62841a63699e84eae8862222))
- **build:** add warnings to broccoli-workbox stdout ([d5b4362](https://github.com/BBVAEngineering/ember-cli-workbox/commit/d5b43625fe576d2fd41985a19a927c24d3e78623)), closes [#91](https://github.com/BBVAEngineering/ember-cli-workbox/issues/91)
- remove getWithDefault deprecation ([e5fe855](https://github.com/BBVAEngineering/ember-cli-workbox/commit/e5fe855a2e647be415522a259b0b78f5c691fd10)), closes [#101](https://github.com/BBVAEngineering/ember-cli-workbox/issues/101)

### Features

- use rootURL when registering service worker ([5eb0af6](https://github.com/BBVAEngineering/ember-cli-workbox/commit/5eb0af60eea03308b623e336231dc97ae84238e0)), closes [#102](https://github.com/BBVAEngineering/ember-cli-workbox/issues/102) [#100](https://github.com/BBVAEngineering/ember-cli-workbox/issues/100)

### BREAKING CHANGES

- appending rootURL to service worker could break some apps

# [1.2.0](https://github.com/BBVAEngineering/ember-cli-workbox/compare/v1.1.0...v1.2.0) (2020-07-07)

### Features

- move files to the addon directory ([1e4f39a](https://github.com/BBVAEngineering/ember-cli-workbox/commit/1e4f39a9310490eb279fb44a9816e257535e5ea1))

# [1.1.0](https://github.com/BBVAEngineering/ember-cli-workbox/compare/v1.0.1...v1.1.0) (2020-06-16)

### Features

- **config:** new option 'importScriptsGlobPatterns' ([722c038](https://github.com/BBVAEngineering/ember-cli-workbox/commit/722c03840fe8bb924ab973ecbe00b9a32c249ef2))

## [1.0.1](https://github.com/BBVAEngineering/ember-cli-workbox/compare/v1.0.0...v1.0.1) (2020-02-10)

### Bug Fixes

- **build:** do not ignore .gitkeep from npm ([59994a3](https://github.com/BBVAEngineering/ember-cli-workbox/commit/59994a3ef879cc7ea752fd25755074b5e065be54))
- **build:** ensure dir is created ([1ee3d00](https://github.com/BBVAEngineering/ember-cli-workbox/commit/1ee3d00b5f9339ccd061be08238a62b0327319ac))

# [1.0.0](https://github.com/BBVAEngineering/ember-cli-workbox/compare/v0.6.1...v1.0.0) (2020-02-10)

### Features

- **package:** upgrade deps ([d1a4fad](https://github.com/BBVAEngineering/ember-cli-workbox/commit/d1a4fad20ff8ae5d6e334cfe7a26061cdc75d9ce))
- **service:** change events ([18ca8fa](https://github.com/BBVAEngineering/ember-cli-workbox/commit/18ca8fa19dee5e4dcc38bb319113ef028a7734aa))
- **service:** es6 classes ([d4a20bf](https://github.com/BBVAEngineering/ember-cli-workbox/commit/d4a20bf8c24fcfe0f4cea7c4c0d4e5db0b5d2535))
- **sw:** new life cycle ([81932ac](https://github.com/BBVAEngineering/ember-cli-workbox/commit/81932acf7954c3711af33606dad131f68cc02f4c))

### Styles

- **sw:** empty line ([6047fa8](https://github.com/BBVAEngineering/ember-cli-workbox/commit/6047fa8f2b0e695b4f6dbdf33a716394050a629e))

### BREAKING CHANGES

- **sw:** Update workbox to v5

## [0.6.1](https://github.com/BBVAEngineering/ember-cli-workbox/compare/v0.6.0...v0.6.1) (2020-01-14)

### Bug Fixes

- **sw:** do not create empty SW when disabled ([af1cf2d](https://github.com/BBVAEngineering/ember-cli-workbox/commit/af1cf2d)), closes [#78](https://github.com/BBVAEngineering/ember-cli-workbox/issues/78)

# [0.6.0](https://github.com/BBVAEngineering/ember-cli-workbox/compare/v0.5.2...v0.6.0) (2019-12-16)

### Features

- add importScriptsTransform option ([440f1f1](https://github.com/BBVAEngineering/ember-cli-workbox/commit/440f1f1))

## [0.5.2](https://github.com/BBVAEngineering/ember-cli-workbox/compare/v0.5.1...v0.5.2) (2019-03-08)

### Bug Fixes

- **package:** update workbox-build to version 4.1.0 ([84f6f95](https://github.com/BBVAEngineering/ember-cli-workbox/commit/84f6f95)), closes [#26](https://github.com/BBVAEngineering/ember-cli-workbox/issues/26)

## [0.5.1](https://github.com/BBVAEngineering/ember-cli-workbox/compare/v0.5.0...v0.5.1) (2019-01-09)

### Bug Fixes

- force publish patch ([a1a2e0d](https://github.com/BBVAEngineering/ember-cli-workbox/commit/a1a2e0d))
