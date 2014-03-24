'use strict';

var config = require('./lib/config/config');
require('./lib/adapters/database')(config);

var koa = require('koa');
var app = koa();

app.secret = config.secret;

if (app.env === 'development') {
  app.use(require('koa-logger')());
  app.use(require('koa-json')());
}

require('./lib/routes.js')(app);

app.listen(config.port);
