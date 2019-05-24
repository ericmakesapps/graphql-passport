const authenticateMiddleware = jest.fn();

export default {
  authenticate: jest.fn((name, options, done) => {
    done(null, { id: 'user-id' }, { info: true });
    return authenticateMiddleware;
  }),
  authenticateMiddleware,
};
