/* eslint-disable no-param-reassign */

import util from 'util';
import Strategy from 'passport-strategy';
import { UserTemplate, PassportRequest } from './types';

type VerifyFn = (username: unknown, password: unknown, done: () => void) => void;
type VerifyFnWRequest = (
  req: Request,
  username: unknown,
  password: unknown,
  done: () => void,
) => void;

interface GraphQLLocalStrategyOptions {
  passReqToCallback?: boolean;
}

function GraphQLLocalStrategy(options: VerifyFn): void;
function GraphQLLocalStrategy(
  options: GraphQLLocalStrategyOptions,
  verify: VerifyFn | VerifyFnWRequest,
): void;
function GraphQLLocalStrategy(
  options?: GraphQLLocalStrategyOptions | VerifyFn | VerifyFnWRequest,
  verify?: VerifyFn | VerifyFnWRequest,
) {
  if (typeof options === 'function') {
    this.verify = options;
    this.passReqToCallback = false;
  } else {
    this.verify = verify;
    this.passReqToCallback = options.passReqToCallback;
  }
  if (!this.verify) { throw new TypeError('GraphQLLocalStrategy requires a verify callback'); }

  // @ts-ignore
  Strategy.call(this);
  this.name = 'graphql-local';
}

util.inherits(GraphQLLocalStrategy, Strategy);

GraphQLLocalStrategy.prototype.authenticate = function authenticate(
  req: PassportRequest,
  options: { username?: string, email?: string, password: string },
) {
  const { username, email, password } = options;

  const done = (err: Error, user: UserTemplate, info?: unknown) => {
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
