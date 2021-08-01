import { IVerifyOptions, PassportContext } from './types';

import { Request as ExpressRequest } from 'express';
/* eslint-disable no-param-reassign */
import { Strategy as PassportStrategy } from 'passport-strategy';

type VerifyFn<TInput, TUser extends {}, TRequest extends ExpressRequest> = ({
  req,
  input,
  done,
}: {
  req: TRequest;
  input: TInput;
  done: (error: any, user: TUser, options?: IVerifyOptions) => void;
}) => void;

interface GraphQLLocalStrategyOptions {
  passReqToCallback?: boolean;
}

class GraphQLLocalStrategy<
  TInput,
  TUser extends {},
  TRequest extends ExpressRequest = ExpressRequest
> extends PassportStrategy {
  constructor(verify: VerifyFn<TInput, TUser, TRequest>, options?: GraphQLLocalStrategyOptions) {
    super();

    this.verify = verify;
    this.passReqToCallback = options?.passReqToCallback ?? false;

    this.name = 'graphql-local';
  }

  verify: VerifyFn<TInput, TUser, TRequest>;

  passReqToCallback: boolean | undefined;

  name: string;

  authenticate(req: TRequest, input: TInput) {
    const done = (err: Error, user: TUser, info?: IVerifyOptions) => {
      if (err) {
        return this.error(err);
      }
      if (!user) {
        return this.fail(info, 401);
      }
      return this.success(user, info);
    };

    if (this.passReqToCallback) {
      this.verify({ req, input, done });
    }
  }
}

export default GraphQLLocalStrategy;
