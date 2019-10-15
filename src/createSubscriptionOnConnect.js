const executeMiddlewares = (middlewares, webSocket, resolve) => {
  if (middlewares.length === 0) {
    resolve({ req: webSocket.upgradeReq });
  } else {
    const nextMiddleware = middlewares[0];
    const remainingMiddlewares = middlewares.slice(1);
    const response = {};
    nextMiddleware(
      webSocket.upgradeReq,
      response,
      () => executeMiddlewares(remainingMiddlewares, webSocket, resolve)
    );
  }
};

/**
 * Create the Apollo server subscriptions.onConnect option to use buildContext with subscriptions.
 * We need to apply the middlewares required for authentication to the websockets initial http
 * request. Usually, these middlewares are session(...), passport.initialize(...) and
 * passport.session(...). Provide the same instances of theses middlewares as used with your
 * express server.
 *
 * @param {array} middlewares session and passport related middlewares
 */
const createSubscriptionOnConnect = (middlewares) => {
  const onConnect = (connectionParams, webSocket) => {
    return new Promise(resolve => executeMiddlewares(middlewares, webSocket, resolve));
  };

  return onConnect;
};

export default createSubscriptionOnConnect;
