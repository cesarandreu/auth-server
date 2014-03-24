'use strict';

var Router = require('koa-router'),
  formidable = require('koa-formidable'),
  user = require('./controllers/user');

module.exports = function(app) {


  var auth = new Router();

  auth.post('/login',
    formidable(),
    user.login
  );

  auth.post('/register',
    formidable(),
    user.register
  );

  app.use(auth.middleware());

  // Parses body, checks username/password and return a JWT
  // otherwise it returns a 422
  // app.post('/login');

  // Parses body, checks validity of all params
  // if invalid returns a 422
  // otherwise sends an email to validate
  // app.post('/signup');

  // Parses body, if valid then it activates the account
  // app.get('/validate');

};
