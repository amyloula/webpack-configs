# webpack-configs
Webpack production config

Configured to handle:

css preprocessing for sass and less - including scss/less files in node_modules for when using third party ui libraries. transpiling of es6, minification, ubfuscation, removal of flow type comments, generates bundle trackers for js and css separately, each bundle is accessible as a library, generates .gz of js files if you wish to serve gzipped js, generates a service worker which includes the js and css files, as well as runtime caching for images with a cachefirst strategy
