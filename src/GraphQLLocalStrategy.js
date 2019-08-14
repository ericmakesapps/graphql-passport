/* eslint-disable no-param-reassign */

import util from 'util';
import Strategy from 'passport-strategy';

function GraphQLLocalStrategy(options, verify) {
  if (typeof options === 'function') {
    verify = options;
    options = {};
  }
  if (!verify) { throw new TypeError('GraphQLLocalStrategy requires a verify callback'); }

  Strategy.call(this);
  this.name = 'graphql-local';
  this.verify = verify;
  this.passReqToCallback = options.passReqToCallback;
}

util.inherits(GraphQLLocalStrategy, Strategy);

GraphQLLocalStrategy.prototype.authenticate = function authenticate(req, options) {
  const { username, email, password } = options;

  const done = (err, user, info) => {
    if (err) { return this.error(err); }
    if (!user) { return this.fail(info); }
    return this.success(user, info);
  };

  if (this.passReqToCallback) {
    this.verify(req, username || email, password, done);
  } else {
    this.verify(username || email, password, done);
  }
};

export default GraphQLLocalStrategy;
