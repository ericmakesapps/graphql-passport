"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _util = _interopRequireDefault(require("util"));

var _passportStrategy = _interopRequireDefault(require("passport-strategy"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint-disable no-param-reassign */
function GraphQLLocalStrategy(options, verify) {
  if (typeof options === 'function') {
    verify = options;
    options = {};
  }

  if (!verify) {
    throw new TypeError('GraphQLLocalStrategy requires a verify callback');
  }

  _passportStrategy["default"].call(this);

  this.name = 'graphql-local';
  this.verify = verify;
  this.passReqToCallback = options.passReqToCallback;
}

_util["default"].inherits(GraphQLLocalStrategy, _passportStrategy["default"]);

GraphQLLocalStrategy.prototype.authenticate = function authenticate(req, options) {
  var _this = this;

  var username = options.username,
      email = options.email,
      password = options.password;

  var done = function done(err, user, info) {
    if (err) {
      return _this.error(err);
    }

    if (!user) {
      return _this.fail(info);
    }

    return _this.success(user, info);
  };

  if (this.passReqToCallback) {
    this.verify(req, username || email, password, done);
  } else {
    this.verify(username || email, password, done);
  }
};

var _default = GraphQLLocalStrategy;
exports["default"] = _default;