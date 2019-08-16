"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _passport = _interopRequireDefault(require("passport"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var promisifiedAuthenticate = function promisifiedAuthenticate(req, res, name, options) {
  return new Promise(function (resolve, reject) {
    return _passport["default"].authenticate(name, options, function (err, user, info) {
      if (err) reject(err);else resolve({
        user: user,
        info: info
      });
    })(req, res);
  });
};

var promisifiedLogin = function promisifiedLogin(req, user, options) {
  return new Promise(function (resolve, reject) {
    return req.login(user, options, function (err) {
      if (err) reject(err);else resolve();
    });
  });
};

var buildContext = function buildContext(contextParams) {
  var req = contextParams.req,
      res = contextParams.res;
  return _objectSpread({
    authenticate: function authenticate(name, options) {
      return promisifiedAuthenticate(req, res, name, options);
    },
    login: function login(user, options) {
      return promisifiedLogin(req, user, options);
    },
    logout: function logout() {
      return req.logout();
    },
    isAuthenticated: function isAuthenticated() {
      return req.isAuthenticated();
    },
    isUnauthenticated: function isUnauthenticated() {
      return req.isUnauthenticated();
    },

    get user() {
      return req.user;
    }

  }, contextParams);
};

var _default = buildContext;
exports["default"] = _default;