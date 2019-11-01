/* eslint-disable max-len */
import passport, { AuthenticateOptions } from 'passport';
// eslint-disable-next-line import/no-extraneous-dependencies
import express from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ExecutionParams } from 'subscriptions-transport-ws';
import { UserTemplate, AuthenticateReturn, IVerifyOptions } from './types';

const promisifiedAuthentication = (
  req: express.Request,
  res: express.Response,
  name: string,
  options: AuthenticateOptions,
) => {
  const p = new Promise<AuthenticateReturn>((resolve, reject) => {
    const done = (
      err: Error | undefined,
      user: UserTemplate | undefined,
      info?: IVerifyOptions | undefined,
    ) => {
      if (err) reject(err);
      else resolve({ user, info });
    };

    const authFn = passport.authenticate(name, options, done);
    return authFn(req, res, done);
  });

  return p;
};

const promisifiedLogin = (
  req: express.Request,
  user: UserTemplate,
  options: AuthenticateOptions,
) => {
  const p = new Promise<void>((resolve, reject) => {
    const done = (err: Error | undefined) => {
      if (err) reject(err);
      else resolve();
    };

    req.login(user, options, done);
  });

  return p;
};

export interface Context {
  isAuthenticated: () => boolean;
  isUnauthenticated: () => boolean;
  getUser: () => UserTemplate;
  authenticate: (strategyName: string, options?: object) => Promise<AuthenticateReturn>;
  login: (user: UserTemplate, options?: object) => Promise<void>;
  logout: () => void;
  req: express.Request;
  res?: express.Response;
}

const buildCommonContext = (req: express.Request, additionalContext: {}): Context => ({
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

export interface RegularContextParams {
  req: express.Request;
  res: express.Response;
  payload?: unknown;
  connection?: undefined;
}

export interface SubscriptionContextParams {
  req: express.Request;
  res: express.Response;
  connection: { context: { req: express.Request } };
  payload?: unknown;
}

export interface ExpressContext {
  req: express.Request;
  res: express.Response;
  connection?: ExecutionParams;
  payload?: unknown;
}

// function buildContext(contextParams: RegularContextParams): Context;
// function buildContext(contextParams: SubscriptionContextParams): SubscriptionContext;
const buildContext = <R extends ExpressContext = ExpressContext>(contextParams: R): Context => {
  const {
    req, // set for queries and mutations
    res, // set for queries and mutations
    connection, // set for subscriptions
    payload, // set for subscriptions
    ...additionalContext
  } = contextParams;

  if (connection) {
    return buildCommonContext(connection.context.req, additionalContext);
  }

  return {
    ...buildCommonContext(req, additionalContext),
    authenticate: (name: string, options: AuthenticateOptions) => promisifiedAuthentication(req, res, name, options),
    login: (user: UserTemplate, options: AuthenticateOptions) => promisifiedLogin(req, user, options),
    logout: () => req.logout(),
    res,
  };
};

export default buildContext;
