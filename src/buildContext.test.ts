import passport from 'passport';
import buildContext, { ContextParams } from './buildContext';

describe('context.authenticate', () => {
  test('calls passport authenticate', async () => {
    const req = { req: true } as any;
    const res = { res: true } as any;
    const params = { req, res } as ContextParams;
    const context = await buildContext(params);

    const options = { options: true };
    await context.authenticate('strategy-name', options);

    // @ts-ignore
    expect(passport.authenticateMiddleware).toHaveBeenCalledWith(req, res);
    expect(passport.authenticate).toHaveBeenCalledWith('strategy-name', options, expect.any(Function));
  });

  test('resolves with user and info data', async () => {
    const context = buildContext({ req: {}, res: {} } as ContextParams);
    const { user, info } = await context.authenticate('strategy-name');
    expect(user).toEqual({ id: 'user-id' });
    expect(info).toEqual({ info: true });
  });

  test('rejects when passport returns error', async () => {
    const expectedError = new Error('authentication failed');
    // @ts-ignore
    passport.authenticate.mockImplementationOnce((name, options, done) => done(expectedError));
    const context = buildContext({ req: {}, res: {} } as ContextParams);
    let actualError: Error;

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
    const req = { login: jest.fn((user, options, callback) => callback(null)) } as any;
    const res = { res: true };
    const context = buildContext(({ req, res } as any) as ContextParams);

    const options = { options: true };
    const user = { email: 'max@mustermann.com', password: 'qwerty' };
    await context.login(user, options);

    expect(req.login).toHaveBeenCalledWith(user, options, expect.any(Function));
  });

  test('context.login rejects when passport returns error', async () => {
    const expectedError = new Error('authentication failed');
    const req = { login: jest.fn((user, options, callback) => callback(expectedError)) };
    const context = buildContext(({ req, res: {} } as any) as ContextParams);
    let actualError: Error;

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
    } as ContextParams['req'];
    const context = buildContext({ req, res: {} as any });
    expect(context).toEqual(
      expect.objectContaining({
        logout: expect.any(Function),
        isAuthenticated: expect.any(Function),
        isUnauthenticated: expect.any(Function),
      }),
    );
  });

  test('passport user is copied from request', () => {
    const req = {
      user: { user: true },
    } as any;
    const context = buildContext({ req, res: {} as any });
    expect(context.getUser()).toBe(req.user);
  });

  test('getUser returns passport user from request', () => {
    const req = {
      user: { user: true },
    } as any;
    const context = buildContext({ req, res: {} as any });
    expect(context.getUser()).toBe(req.user);
  });
});
