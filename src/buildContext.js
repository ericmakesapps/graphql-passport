import passport from 'passport';

const promisifiedAuthenticate = (req, res, name, options) => new Promise(
  (resolve, reject) => passport.authenticate(name, options, (err, user, info) => {
    if (err) reject(err);
    else resolve({ user, info });
  })(req, res),
);

const promisifiedLogin = (req, user, options) => new Promise(
  (resolve, reject) => req.login(user, options, (err) => {
    if (err) reject(err);
    else resolve();
  }),
);

const buildCommonContext = (req, additionalContext) => ({
  isAuthenticated: () => req.isAuthenticated(),
  isUnauthenticated: () => req.isUnauthenticated(),
  get user() {
    // eslint-disable-next-line no-console
    console.warn('context.user is deprecated and will be removed. Please use context.getUser() instead');
    return req.user;
  },
  getUser: () => req.user,
  req,
  ...additionalContext,
});

/**
 * @typedef {Object} Context
 * @property {function(): boolean} isAuthenticated
 * @property {function(): boolean} isUnauthenticated
 * @property {function(): object} getUser
 * @property {function(string, object): void} authenticate accepts strategy name and options
 * @property {function(string, object): void} login accepts strategy name and options
 * @property {function(): void} logout
 * @property {object} req the provided request object
 * @property {object} res the provided response object
 */

/**
 * Creates a GraphQL context which allows access to the Passport user object and functions
 *
 * @param {object} contextParams
 * @param {object} [contextParams.req] request object for queries and mutations
 * @param {object} [contextParams.res] response object for queries and mutations
 * @param {object} [contextParams.connection] connection object for subscriptions
 * @returns {Context} context containing Passport user and functions
 */
const buildContext = (contextParams) => {
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
    authenticate: (name, options) => promisifiedAuthenticate(req, res, name, options),
    login: (user, options) => promisifiedLogin(req, user, options),
    logout: () => req.logout(),
    res,
    ...buildCommonContext(req, additionalContext),
  };
};

export default buildContext;
