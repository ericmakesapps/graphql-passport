/* eslint-disable max-len */
import passport, { AuthenticateOptions } from 'passport';
import express from 'express';
import { ExecutionParams } from 'subscriptions-transport-ws';
import { AuthenticateReturn, IVerifyOptions } from './types';

const promisifiedAuthentication = <UserObjectType extends {}>(
  req: express.Request,
  res: express.Response,
  name: string,
  options: AuthenticateOptions,
) => {
  const p = new Promise<AuthenticateReturn<UserObjectType>>((resolve, reject) => {
    const done = (err: Error | undefined, user: UserObjectType | undefined, info?: IVerifyOptions | undefined) => {
      if (err) reject(err);
      else resolve({ user, info });
    };

    const authFn = passport.authenticate(name, options, done);
    return authFn(req, res);
  });

  return p;
};

const promisifiedLogin = <UserObjectType extends {}>(
  req: express.Request,
  user: UserObjectType,
  options?: AuthenticateOptions,
) =>
  new Promise<void>((resolve, reject) => {
    const done = (err: Error | undefined) => {
      if (err) reject(err);
      else resolve();
    };

    req.login(user, options, done);
  });

interface CommonRequest<UserObjectType extends {}>
  extends Pick<Context<UserObjectType>, 'isAuthenticated' | 'isUnauthenticated'> {
  user?: UserObjectType;
}

export interface Context<UserObjectType extends {}> {
  isAuthenticated: () => boolean;
  isUnauthenticated: () => boolean;
  getUser: () => UserObjectType;
  authenticate: (strategyName: string, options?: object) => Promise<AuthenticateReturn<UserObjectType>>;
  login: (user: UserObjectType, options?: object) => Promise<void>;
  logout: () => void;
  res?: express.Response;
  req: CommonRequest<UserObjectType>;
}

const buildCommonContext = <UserObjectType extends {}>(req: CommonRequest<UserObjectType>, additionalContext: {}) => ({
  isAuthenticated: () => req.isAuthenticated(),
  isUnauthenticated: () => req.isUnauthenticated(),
  getUser: () => req.user,
  authenticate: (strategyName: string) => {
    throw new Error(`Authenticate (${strategyName}) not implemented for subscriptions`);
  },
  login: () => {
    throw new Error('Not implemented for subscriptions');
  },
  logout: () => {
    throw new Error('Not implemented for subscriptions');
  },
  req,
  ...additionalContext,
});

export interface ContextParams {
  req: express.Request;
  res: express.Response;
  connection?: ExecutionParams;
  payload?: unknown;
}

// function buildContext(contextParams: RegularContextParams): Context;
// function buildContext(contextParams: SubscriptionContextParams): SubscriptionContext;
const buildContext = <UserObjectType extends {}, R extends ContextParams = ContextParams>(
  contextParams: R,
): Context<UserObjectType> => {
  const {
    req, // set for queries and mutations
    res, // set for queries and mutations
    connection, // set for subscriptions
    payload, // set for subscriptions
    ...additionalContext
  } = contextParams;

  if (connection) {
    return buildCommonContext<UserObjectType>(connection.context.req, additionalContext);
  }

  // The UserObject is without the any in conflict: "'User' is not assignable to type 'UserObjectType'"
  const sharedContext = buildCommonContext<UserObjectType>(req as any, additionalContext);
  return {
    ...sharedContext,
    authenticate: (name: string, options: AuthenticateOptions) => promisifiedAuthentication(req, res, name, options),
    login: (user: UserObjectType, options: AuthenticateOptions) => promisifiedLogin<UserObjectType>(req, user, options),
    logout: () => req.logout(),
    res,
  };
};

export default buildContext;
