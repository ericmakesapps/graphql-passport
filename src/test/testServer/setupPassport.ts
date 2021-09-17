import passport from 'passport';
import { GraphQLLocalStrategy } from '../../index';
import { InfoArgument } from '../../types';
import { User as UserModel, UserAPI } from './UserAPI';

declare global {
  namespace Express {
    interface User extends UserModel {}
  }
}

export default () => {
  if (!passport.serializeUser) {
    return passport;
  }

  passport.serializeUser<number>((user, done) => {
    done(undefined, user.id);
  });

  passport.deserializeUser<number>(async (id, done) => {
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
    done: (error: Error | null, authenticatedUser: UserModel, info?: InfoArgument) => unknown,
  ) => {
    // Adjust this callback to your needs
    const userAPI = UserAPI.getInstance();
    const authenticatedUser = userAPI.authenticate(name, password);
    done(null, authenticatedUser, !authenticatedUser && 'failed to authenticate user');
  };

  passport.use(new GraphQLLocalStrategy(userAuthenticator));

  return passport;
};
