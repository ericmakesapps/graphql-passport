import { AuthenticationError } from 'apollo-server';
import { GraphQLLocalStrategy } from '../../index';
import { User, UserAPI } from './UserAPI';

const realPassword = jest.requireActual('passport');

export default () => {
  if (!realPassword.serializeUser) {
    return realPassword;
  }

  // @ts-ignore
  realPassword.serializeUser<User, number>((user, done) => {
    done(undefined, user.id);
  });

  // @ts-ignore
  realPassword.deserializeUser<User, number>(async (id, done) => {
    try {
      const userAPI = UserAPI.getInstance();
      const user = userAPI.find(id);
      return done(undefined, user);
    } catch (err) {
      return done(err);
    }
  });

  const userAuthenticator = (
    name: string,
    password: string,
    done: (error: Error | null, authenticatedUser: User) => unknown,
  ) => {
    // Adjust this callback to your needs
    const userAPI = UserAPI.getInstance();
    const authenticatedUser = userAPI.authenticate(name, password);
    const error = authenticatedUser ? null : new AuthenticationError('no matching user');
    done(error, authenticatedUser);
  };

  realPassword.use(new GraphQLLocalStrategy(userAuthenticator));

  return realPassword;
};
