import { Request } from 'express';
import GraphQLLocalStrategy from './GraphQLLocalStrategy';

describe('GraphQLLocalStrategy test', () => {
  test('authenticate calls verify with username as default', () => {
    const verify = jest.fn();
    const strategy = new GraphQLLocalStrategy(verify);
    strategy.authenticate(({} as any) as Request, {
      username: 'some-username',
      password: 'qwerty',
    });
    expect(verify).toHaveBeenCalledWith(
      expect.objectContaining({
        req: expect.any(Object),
        input: { username: 'some-username', password: 'qwerty' },
        done: expect.any(Function),
      }),
    );
  });

  test('passing request to verify callback', () => {
    const verify = jest.fn();
    const strategy = new GraphQLLocalStrategy(verify);
    const req = ({ test: 'test' } as any) as Request;
    strategy.authenticate(req, { email: 'max@mustermann.com', password: 'qwerty' });
    expect(verify).toHaveBeenCalledWith(
      expect.objectContaining({ req, input: expect.any(Object), done: expect.any(Function) }),
    );
  });

  test('done callback calls strategy.success if user is provided', () => {
    const verify = jest.fn();
    const strategy = new GraphQLLocalStrategy(verify);
    strategy.success = jest.fn();
    strategy.authenticate(({} as any) as Request, {
      email: 'max@mustermann.com',
      password: 'qwerty',
    });
    const { done } = verify.mock.calls[0][0];
    done(null, { email: 'max@mustermann.com' }, { info: true });
    expect(strategy.success).toHaveBeenCalledWith({ email: 'max@mustermann.com' }, { info: true });
  });

  test('done callback calls strategy.error if error is provided', () => {
    const verify = jest.fn();
    const strategy = new GraphQLLocalStrategy(verify);
    strategy.error = jest.fn();
    strategy.authenticate(({} as any) as Request, {
      email: 'max@mustermann.com',
      password: 'qwerty',
    });
    const { done } = verify.mock.calls[0][0];
    done(new Error('some error'));
    expect(strategy.error).toHaveBeenCalledWith(new Error('some error'));
  });

  test('done callback calls strategy.fail with info if user is not provided', () => {
    const verify = jest.fn();
    const strategy = new GraphQLLocalStrategy(verify);
    strategy.fail = jest.fn();
    strategy.authenticate(({} as any) as Request, {
      email: 'max@mustermann.com',
      password: 'qwerty',
    });
    const { done } = verify.mock.calls[0][0];
    done(null, null, { info: true });
    expect(strategy.fail).toHaveBeenCalledWith({ info: true }, 401);
  });
});
