// eslint-disable-next-line import/no-extraneous-dependencies
import ws from 'ws';
import { IncomingMessage } from 'http';

// tslint:disable-next-line:no-empty-interface
export interface AuthInfoTemplate { }
// tslint:disable-next-line:no-empty-interface
export interface UserTemplate { }

export interface PassportRequest {
  authInfo?: AuthInfoTemplate;
  user?: UserTemplate;

  // These declarations are merged into express's Request type
  login(user: UserTemplate, done: (err: any) => void): void;
  login(user: UserTemplate, options: any, done: (err: any) => void): void;
  logIn(user: UserTemplate, done: (err: any) => void): void;
  logIn(user: UserTemplate, options: any, done: (err: any) => void): void;

  logout(): void;
  logOut(): void;

  isAuthenticated(): boolean;
  isUnauthenticated(): boolean;
}

export interface WebSocket extends ws {
  upgradeReq: IncomingMessage & PassportRequest;
}
