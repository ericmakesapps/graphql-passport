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
    expect(passport.authenticate).toHaveBeenCalledWith('strategy-name', options, expect.any(Function));
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

    expect(req.login).toHaveBeenCalledWith(user, options, expect.any(Function));
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
    expect(context).toEqual(expect.objectContaining({
      logout: expect.any(Function),
      isAuthenticated: expect.any(Function),
      isUnauthenticated: expect.any(Function),
    }));
  });

  test('passport user is copied from request', () => {
    const req = {
      user: { user: true },
    };
    const context = buildContext({ req, res: {} });
    expect(context.user).toBe(req.user);
  });
});
