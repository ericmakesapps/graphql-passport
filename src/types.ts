import ws from 'ws';
import { Request as ExpressRequest } from 'express';
import { IncomingMessage } from 'http';
import { ConnectionContext } from 'subscriptions-transport-ws';

// tslint:disable-next-line:no-empty-interface
export interface AuthInfoTemplate {}

type SharedPassportContext<
  UserObjectType extends {},
  Credentials extends {},
  AuthInfoTemplate extends {},
  Request extends object
> = {
  authInfo?: AuthInfoTemplate;
  user?: UserObjectType;
  getUser(): UserObjectType | undefined;

  login(user: Credentials, options?: any): Promise<void>;

  logout(): void;
  logOut(): void;

  isAuthenticated(): boolean;
  isUnauthenticated(): boolean;

  authenticate(type: string, credentials: Credentials): Promise<{ user: UserObjectType }>;

  req: Request;
};

export type PassportContext<
  UserObjectType extends {},
  Credentials extends {},
  AuthInfoTemplate extends {} = {},
  Request extends object = ExpressRequest
> = SharedPassportContext<UserObjectType, Credentials, AuthInfoTemplate, Request>;

export type PassportSubscriptionContext<
  UserObjectType extends {},
  Credentials extends {},
  AuthInfoTemplate extends {} = {},
  SubscriptionRequest extends object = ConnectionContext
> = SharedPassportContext<UserObjectType, Credentials, AuthInfoTemplate, SubscriptionRequest>;

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
