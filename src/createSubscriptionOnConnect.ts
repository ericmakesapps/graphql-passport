import { Response } from 'express';
import { WebSocket } from './types';

type MiddlewareFns = (req: WebSocket['upgradeReq'], res: Response, resolve: (r: { req: WebSocket }) => unknown) => void;
interface ReturnOnConnect {
  req: WebSocket['upgradeReq'];
}

const executeMiddlewares = (
  middlewares: MiddlewareFns[],
  webSocket: WebSocket,
  resolve: (value: ReturnOnConnect | PromiseLike<ReturnOnConnect>) => void,
) => {
  if (middlewares.length === 0) {
    const { upgradeReq } = webSocket;
    resolve({ req: upgradeReq });
  } else {
    const nextMiddleware = middlewares[0];
    const remainingMiddlewares = middlewares.slice(1);
    const response = {} as Response;
    nextMiddleware(webSocket.upgradeReq, response, () => executeMiddlewares(remainingMiddlewares, webSocket, resolve));
  }
};

const createSubscriptionOnConnect = <T extends ReturnOnConnect>(middlewares: MiddlewareFns[]) => {
  // This is called on each message that has a GQL_CONNECTION_INIT message type
  const onConnect = (connectionParams: Object, webSocket: WebSocket) =>
    new Promise<T>((resolve) => executeMiddlewares(middlewares, webSocket, resolve));

  return onConnect;
};

export default createSubscriptionOnConnect;
