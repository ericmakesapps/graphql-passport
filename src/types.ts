import ws from 'ws';
import { Request as ExpressRequest } from 'express';
import { IncomingMessage } from 'http';
import { ConnectionContext } from 'subscriptions-transport-ws';

// tslint:disable-next-line:no-empty-interface
export interface AuthInfoTemplate {}

export type PassportContext<U extends {}, Request extends object> = Request & {
  authInfo?: AuthInfoTemplate;
  user?: U;

  login(user: U, done: (err: any) => void): void;
  login(user: U, options: any, done: (err: any) => void): void;
  logIn(user: U, done: (err: any) => void): void;
  logIn(user: U, options: any, done: (err: any) => void): void;

  logout(): void;
  logOut(): void;

  isAuthenticated(): boolean;
  isUnauthenticated(): boolean;

  authenticate(
    type: string,
    credentials: { username: string; password: string } | { email: string; password: string },
  ): Promise<{ user: U }>;
};

export type PassportSubscriptionContext<
  U extends {},
  SubscriptionRequest extends object = ConnectionContext
> = SubscriptionRequest & {
  authInfo?: AuthInfoTemplate;
  user?: U;

  login(user: U, done: (err: any) => void): void;
  login(user: U, options: any, done: (err: any) => void): void;
  logIn(user: U, done: (err: any) => void): void;
  logIn(user: U, options: any, done: (err: any) => void): void;

  logout(): void;
  logOut(): void;

  isAuthenticated(): boolean;
  isUnauthenticated(): boolean;

  authenticate(
    type: string,
    credentials: { username: string; password: string } | { email: string; password: string },
  ): Promise<{ user: U }>;
};

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
