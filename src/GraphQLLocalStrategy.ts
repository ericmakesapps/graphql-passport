/* eslint-disable no-param-reassign */
import { Strategy as PassportStrategy } from 'passport-strategy';
import { Request as ExpressRequest } from 'express';
import { PassportContext, InfoArgument } from './types';

type DoneFn = (error: any, user?: any, info?: InfoArgument) => void;
type VerifyFn = (username: unknown, password: unknown, done: DoneFn) => void;
type VerifyFnWRequest = <U extends {}, Request extends object = ExpressRequest>(
  req: Request | PassportContext<U, Request>,
  username: unknown,
  password: unknown,
  done: DoneFn,
) => void;

interface GraphQLLocalStrategyOptions {
  passReqToCallback?: boolean;
}

interface GraphQLLocalStrategyOptionsWithRequest extends GraphQLLocalStrategyOptions {
  passReqToCallback: true;
}

interface GraphQLLocalStrategyOptionsWithoutRequest extends GraphQLLocalStrategyOptions {
  passReqToCallback?: false;
}

class GraphQLLocalStrategy<U extends {}, Request extends ExpressRequest = ExpressRequest> extends PassportStrategy {
  constructor(verify: VerifyFn);
  constructor(options: GraphQLLocalStrategyOptionsWithoutRequest, verify: VerifyFn);
  constructor(options: GraphQLLocalStrategyOptionsWithRequest, verify: VerifyFnWRequest);
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
    if (!this.verify) {
      throw new TypeError('GraphQLLocalStrategy requires a verify callback');
    }

    this.name = 'graphql-local';
  }

  verify: VerifyFn | VerifyFnWRequest;

  passReqToCallback: boolean | undefined;

  name: string;

  authenticate(req: Request, options: { username?: string; email?: string; password: string }) {
    const { username, email, password } = options;

    const done = (err: Error, user: U, info?: InfoArgument) => {
      if (err) {
        return this.error(err);
      }
      if (!user) {
        return this.fail(info, 401);
      }
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
