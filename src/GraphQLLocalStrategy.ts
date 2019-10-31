/* eslint-disable no-param-reassign */

import { Strategy as PassportStrategy } from 'passport-strategy';
import { UserTemplate, PassportRequest } from './types';


interface IVerifyOptions {
  info: boolean;
  message?: string;
}

type VerifyFn = (username: unknown, password: unknown, done: () => void) => void;
type VerifyFnWRequest = (
  req: Request | PassportRequest,
  username: unknown,
  password: unknown,
  done: (error: any, user?: any, options?: IVerifyOptions) => void
) => void;

interface GraphQLLocalStrategyOptions {
  passReqToCallback?: boolean;
}

class GraphQLLocalStrategy extends PassportStrategy {
  constructor(
    options?: GraphQLLocalStrategyOptions | VerifyFn | VerifyFnWRequest,
    verify?: VerifyFn | VerifyFnWRequest,
  ) {
    super();

    if (typeof options === 'function') {
      this.verify = options;
      this.passReqToCallback = false;
    } else {
      this.verify = verify;
      this.passReqToCallback = options.passReqToCallback;
    }
    if (!this.verify) { throw new TypeError('GraphQLLocalStrategy requires a verify callback'); }

    this.name = 'graphql-local';
  }

  verify: VerifyFn | VerifyFnWRequest;

  passReqToCallback: boolean | undefined;

  name: string;

  authenticate(
    req: PassportRequest,
    options: { username?: string, email?: string, password: string },
  ) {
    const { username, email, password } = options;

    const done = (err: Error, user: UserTemplate, info?: IVerifyOptions) => {
      if (err) { return this.error(err); }
      if (!user) { return this.fail(info, 401); }
      return this.success(user, info);
    };

    if (this.passReqToCallback) {
      // @ts-ignore - not sure how tow handle this nicely in TS
      this.verify(req, username || email, password, done);
    } else {
      // @ts-ignore - not sure how tow handle this nicely in TS
      this.verify(username || email, password, done);
    }
  }
}

export default GraphQLLocalStrategy;
