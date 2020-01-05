import ws from 'ws';
import { Request as ExpressRequest } from 'express';
import { IncomingMessage } from 'http';
import { ConnectionContext } from 'subscriptions-transport-ws';

type DoneLoggingIn<UserObjectType extends {}> = (err: any, user: UserObjectType) => void;

type SharedPassportContext<UserObjectType extends {}, Credentials extends {}, AuthInfoTemplate extends {}> = {
  authInfo?: AuthInfoTemplate;
  user?: UserObjectType;
  getUser(): UserObjectType | undefined;

  login(user: Credentials, done: DoneLoggingIn<UserObjectType>): void;
  login(user: Credentials, options: any, done: DoneLoggingIn<UserObjectType>): void;
  logIn(user: Credentials, done: DoneLoggingIn<UserObjectType>): void;
  logIn(user: Credentials, options: any, done: DoneLoggingIn<UserObjectType>): void;

  logout(): void;
  logOut(): void;

  isAuthenticated(): boolean;
  isUnauthenticated(): boolean;

  authenticate(type: string, credentials: Credentials): Promise<{ user: UserObjectType }>;
};

export type PassportContext<
  UserObjectType extends {},
  Credentials extends {},
  AuthInfoTemplate extends {} = {},
  Request extends object = ExpressRequest
> = Request & SharedPassportContext<UserObjectType, Credentials, AuthInfoTemplate>;

export type PassportSubscriptionContext<
  UserObjectType extends {},
  Credentials extends {},
  AuthInfoTemplate extends {} = {},
  SubscriptionRequest extends object = ConnectionContext
> = SubscriptionRequest & SharedPassportContext<UserObjectType, Credentials, AuthInfoTemplate>;

export interface IVerifyOptions {
  info: boolean;
  message?: string;
}

export interface AuthenticateReturn<UserObjectType extends {}> {
  user: UserObjectType | undefined;
  info: IVerifyOptions | undefined;
}

export interface WebSocket<Request extends {} = ExpressRequest> extends ws {
  upgradeReq: IncomingMessage & Request;
}
