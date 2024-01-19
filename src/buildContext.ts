/* eslint-disable max-len */
import passport, { AuthenticateOptions } from 'passport';
import express from 'express';
import { ExecutionParams } from 'subscriptions-transport-ws';
import { AuthenticateReturn, InfoArgument } from './types';

const promisifiedAuthentication = <UserObjectType extends Express.User>(
  req: express.Request,
  res: express.Response,
  name: string,
  options: AuthenticateOptions,
) =>
  new Promise<AuthenticateReturn<UserObjectType>>((resolve, reject) => {
    const done = (err: Error | undefined, user: UserObjectType | undefined, info?: InfoArgument | undefined) => {
      if (err) reject(err);
      else resolve({ user, info });
    };

    const authFn = passport.authenticate(name, options, done);
    return authFn(req, res);
  });

const promisifiedLogin = <UserObjectType extends Express.User>(
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

const promisifiedLogout = (req: express.Request, options?: { keepSessionInfo?: boolean }) =>
  new Promise<void>((resolve, reject) => {
    const done = (err: Error | undefined) => {
      if (err) reject(err);
      else resolve();
    };

    req.logout(options, done);
  });

export interface CommonRequest<UserObjectType extends Express.User>
  extends Pick<Context<UserObjectType>, 'isAuthenticated' | 'isUnauthenticated'> {
  user?: UserObjectType;
}

export interface Context<UserObjectType extends Express.User> {
  isAuthenticated: () => boolean;
  isUnauthenticated: () => boolean;
  getUser: () => UserObjectType;
  authenticate: (strategyName: string, options?: object) => Promise<AuthenticateReturn<UserObjectType>>;
  login: (user: UserObjectType, options?: object) => Promise<void>;
  logout: (options?: object) => Promise<void>;
  res?: express.Response;
  req: CommonRequest<UserObjectType>;
}

const buildCommonContext = <UserObjectType extends Express.User>(
  req: CommonRequest<UserObjectType>,
  additionalContext: {},
) => ({
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
const buildContext = <UserObjectType extends Express.User, R extends ContextParams = ContextParams>(
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
    logout: (options: { keepSessionInfo?: boolean }) => promisifiedLogout(req, options),
    res,
  };
};

export default buildContext;
