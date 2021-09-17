import ws from 'ws';
import { Request as ExpressRequest } from 'express';
import { IncomingMessage } from 'http';
import { ConnectionContext } from 'subscriptions-transport-ws';

// tslint:disable-next-line:no-empty-interface
export interface AuthInfoTemplate {}

type SharedPassportContext<
  UserObjectType extends {},
  Credentials extends {},
  AuthInfo extends AuthInfoTemplate,
  Request extends object,
> = {
  authInfo?: AuthInfo;
  user?: UserObjectType;
  getUser(): UserObjectType | undefined;

  login(user: UserObjectType, options?: any): Promise<void>;

  logout(): void;
  logOut(): void;

  isAuthenticated(): boolean;
  isUnauthenticated(): boolean;

  authenticate(type: string, credentials: Credentials): Promise<AuthenticateReturn<UserObjectType>>;

  req: Request;
};

export type PassportContext<
  UserObjectType extends {},
  Credentials extends {},
  AuthInfo extends AuthInfoTemplate = AuthInfoTemplate,
  Request extends object = ExpressRequest,
> = SharedPassportContext<UserObjectType, Credentials, AuthInfo, Request>;

export type PassportSubscriptionContext<
  UserObjectType extends {},
  Credentials extends {},
  AuthInfo extends AuthInfoTemplate = AuthInfoTemplate,
  SubscriptionRequest extends object = ConnectionContext,
> = SharedPassportContext<UserObjectType, Credentials, AuthInfo, SubscriptionRequest>;

export type InfoArgument =
  | string
  | {
      info: boolean;
      message?: string;
    };

export interface AuthenticateReturn<UserObjectType extends {}> {
  user: UserObjectType | undefined;
  info: InfoArgument | undefined;
}

export interface WebSocket<Request extends {} = ExpressRequest> extends ws {
  upgradeReq: IncomingMessage & Request;
}
