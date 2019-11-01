import passport, { AuthenticateOptions } from 'passport';
// eslint-disable-next-line import/no-extraneous-dependencies
import express from 'express';
import { PassportRequest, UserTemplate, AuthenticateReturn } from './types';

const promisifiedAuthenticate = (
  req: PassportRequest,
  res: express.Response, name: string,
  options: AuthenticateOptions,
) => new Promise<AuthenticateReturn>(
  (resolve, reject) => passport.authenticate(name, options, (err, user, info) => {
    if (err) reject(err);
    else resolve({ user, info });
  })(req, res),
);

const promisifiedLogin = (
  req: PassportRequest,
  user: UserTemplate,
  options: AuthenticateOptions,
) => new Promise<void>(
  (resolve, reject) => req.login(user, options, (err) => {
    if (err) reject(err);
    else resolve();
  }),
);

export interface SubscriptionContext {
  isAuthenticated: () => boolean;
  isUnauthenticated: () => boolean;
  getUser: () => UserTemplate;
  req: PassportRequest;
}

export interface Context extends SubscriptionContext {
  authenticate: (
    strategyName: string,
    options?: object,
  ) => Promise<AuthenticateReturn>;
  login: (user: UserTemplate, options?: object) => Promise<void>;
  logout: () => void;
}


const buildCommonContext = (req: PassportRequest, additionalContext: {}): SubscriptionContext => ({
  isAuthenticated: () => req.isAuthenticated(),
  isUnauthenticated: () => req.isUnauthenticated(),
  getUser: () => req.user,
  req,
  ...additionalContext,
});

export interface RegularContextParams {
  req: PassportRequest;
  res: Response;
  payload?: unknown;
  connection?: undefined;
}

export interface SubscriptionContextParams {
  req: PassportRequest;
  res: Response;
  connection: { context: { req: PassportRequest } },
  payload?: unknown;
}


// function buildContext(contextParams: RegularContextParams): Context;
// function buildContext(contextParams: SubscriptionContextParams): SubscriptionContext;
const buildContext: ContextFunction<ExpressContext, Context> = (contextParams) => {
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
    authenticate: (
      name: string,
      options: AuthenticateOptions,
    ) => promisifiedAuthenticate(req, res, name, options),
    login: (
      user: UserTemplate,
      options: AuthenticateOptions,
    ) => promisifiedLogin(req, user, options),
    logout: () => req.logout(),
    res,
  };
}

export default buildContext;
