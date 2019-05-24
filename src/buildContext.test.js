import passport from 'passport';
import buildContext from './buildContext';

describe('context.authenticate', () => {
  test('calls passport authenticate', async () => {
    const req = { req: true };
    const res = { res: true };
    const context = buildContext({ req, res });

    const options = { options: true };
    await context.authenticate('strategy-name', options);

    expect(passport.authenticateMiddleware).toHaveBeenCalledWith(req, res);
    expect(passport.authenticate).toHaveBeenCalled();
    expect(passport.authenticate.mock.calls[0][0]).toBe('strategy-name');
    expect(passport.authenticate.mock.calls[0][1]).toBe(options);
    expect(typeof passport.authenticate.mock.calls[0][2]).toBe('function');
  });

  test('resolves with user and info data', async () => {
    const context = buildContext({ req: {}, res: {} });
    const { user, info } = await context.authenticate('strategy-name');
    expect(user).toEqual({ id: 'user-id' });
    expect(info).toEqual({ info: true });
  });

  test('rejects when passport returns error', async () => {
    const expectedError = new Error('authentication failed');
    passport.authenticate.mockImplementationOnce((name, options, done) => done(expectedError));
    const context = buildContext({ req: {}, res: {} });
    let actualError;

    try {
      await context.authenticate('strategy-name');
    } catch (e) {
      actualError = e;
    }

    expect(actualError).toEqual(expectedError);
  });
});

describe('context.login', () => {
  test('calls req.login', async () => {
    const req = { login: jest.fn((user, options, callback) => callback(null)) };
    const res = { res: true };
    const context = buildContext({ req, res });

    const options = { options: true };
    const user = { email: 'max@mustermann.com', password: 'qwerty' };
    await context.login(user, options);

    expect(req.login).toHaveBeenCalled();
    expect(req.login.mock.calls[0][0]).toBe(user);
    expect(req.login.mock.calls[0][1]).toBe(options);
    expect(typeof req.login.mock.calls[0][2]).toBe('function');
  });

  test('context.login rejects when passport returns error', async () => {
    const expectedError = new Error('authentication failed');
    const req = { login: jest.fn((user, options, callback) => callback(expectedError)) };
    const context = buildContext({ req, res: {} });
    let actualError;

    try {
      const options = { options: true };
      const user = { email: 'max@mustermann.com', password: 'qwerty' };
      await context.login(user, options);
    } catch (e) {
      actualError = e;
    }

    expect(actualError).toEqual(expectedError);
  });

  test('passport functions are copied from request', () => {
    const req = {
      logout: () => {},
      isAuthenticated: () => {},
      isUnauthenticated: () => {},
    };
    const context = buildContext({ req, res: {} });
    expect(typeof context.logout).toBe('function');
    expect(typeof context.isAuthenticated).toBe('function');
    expect(typeof context.isUnauthenticated).toBe('function');
  });
});
