'use strict';

var path = require('path');

var rootPath = path.normalize(__dirname + '/../../..'),
  models = path.normalize(rootPath + '/lib/models');


module.exports = {
  port: process.env.PORT || 3000,
  secret: 'banana',
  root: rootPath,
  models: models
};
