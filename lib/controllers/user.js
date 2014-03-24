'use strict';

var _ = require('lodash'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.login = function* login() {
  var ctx = this;

  var user = yield User.findOne({ email: ctx.req.body.email }).exec();

  if (_.isNull(user)) {
    ctx.status = 422;
    ctx.body = {
      message: 'Validation failed',
      name: 'ValidationError',
      errors: {
        email: 'invalid email'
      }
    };
  } else if (!user.authenticate(ctx.req.body.password)) {
    ctx.status = 422;
    ctx.body = {
      message: 'Validation failed',
      name: 'ValidationError',
      errors: {
        password: 'invalid password'
      }
    };
  } else {
    ctx.body = user.getToken(ctx.app.secret);
  }
};

exports.register = function* register() {
  var ctx = this;

  try {
    var newUser = yield User.create(ctx.req.body);
    ctx.body = newUser.info;
  } catch (e) {
    ctx.status = 422;
    ctx.body = e;
  }

};
