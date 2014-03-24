'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  validate = require('mongoose-validator').validate,
  jwt = require('koa-jwt');

var UserSchema = new Schema({
  name: {
    type: String,
    validate: [validate('len', 1, 128)],
    required: true
  },
  email: {
    type: String,
    validate: [validate('isEmail')],
    unique: true,
    required: true
  },
  hashedPassword: {
    type: String,
    default: ''
  },
  salt: {
    type: String
  }
});

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

UserSchema
  .virtual('passwordConfirmation')
  .get(function() {
    return this._passwordConfirmation;
  })
  .set(function(value) {
    this._passwordConfirmation = value;
  });

UserSchema
  .virtual('emailConfirmation')
  .get(function() {
    return this._emailConfirmation;
  })
  .set(function(value) {
    this._emailConfirmation = value;
  });

UserSchema
  .virtual('info')
  .get(function() {
    return {
      name: this.name,
      email: this.email
    };
  });

// Validation
UserSchema
  .path('email')
  .validate(function(email) {
    if (email !== this._emailConfirmation) {
      this.invalidate('emailConfirmation', 'must match email');
    }
  }, null)
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) {
        throw err;
      }
      if(user) {
        if(self.id === user.id) {
          return respond(true);
        }
        return respond(false);
      }
      respond(true);
    });
  }, 'email already in use');


// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function() {

    if (this._password || this._passwordConfirmation) {
      if (this._password.length < 6) {
        this.invalidate('password', 'must be at least 6 characters');
      }
      if (this._password !== this._passwordConfirmation) {
        this.invalidate('passwordConfirmation', 'must match password');
      }
    }

    if (this.isNew && !this._password) {
      this.invalidate('password', 'required');
    }
  }, null);

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) {
      return '';
    }
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  },

  /**
   * Fetch JWT
   *
   * @param {String} secret
   * @param {Object} options
   * @return {String}
   * @api public
   */
  getToken: function(secret, options) {
    if (!secret) {
      throw new Error('Secret is required!');
    }
    return jwt.sign(this.info, secret, options);
  }
};

module.exports = mongoose.model('User', UserSchema);
