'use strict';

var _ = require('lodash');

// Default environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Load environment configuration
 */
module.exports = _.extend(
    require('./env/all.js'),
    require('./env/' + process.env.NODE_ENV + '.js') || {});
