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

const buildContext = (contextParams) => {
  const { req, res } = contextParams;
  return {
    authenticate: (name, options) => promisifiedAuthenticate(req, res, name, options),
    login: (user, options) => promisifiedLogin(req, user, options),
    logout: () => req.logout(),
    isAuthenticated: () => req.isAuthenticated(),
    isUnauthenticated: () => req.isUnauthenticated(),
    get user() {
      return req.user;
    },
    ...contextParams,
  };
};

export default buildContext;
