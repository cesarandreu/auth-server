'use strict';

var mongoose = require('mongoose'),
  fs = require('fs');

module.exports = function(config) {

  mongoose.connect(config.mongo.uri, config.mongo.options);

  fs.readdirSync(config.models).forEach(function (file) {
    if (/(.*)\.(js$)/.test(file)) {
      require(config.models + '/' + file);
    }
  });

};
