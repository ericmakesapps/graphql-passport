import { AuthenticationError, ForbiddenError } from 'apollo-server';
import { MyContext } from './MyContext';

const resolvers = {
  Query: {
    launch(_: unknown, __: unknown, { isAuthenticated }: MyContext) {
      if (!isAuthenticated()) {
        throw new ForbiddenError('You need to be logged in to access launch queries');
      }

      return {
        id: 'LAUNCH_QUERIES',
      };
    },
    me: (_: unknown, __: unknown, { getUser }: MyContext) => getUser(),
    version: () => '1.0',
  },
  LaunchQueries: {
    find(parent: { id: 'LAUNCH_QUERIES' }, { id }: { id: string }, { dataSources: { launchAPI } }: MyContext) {
      return launchAPI.find(parseInt(id, 10));
    },
  },
  Mutation: {
    async login(
      _: unknown,
      { name, password }: { name: string; password: string },
      { authenticate, login }: MyContext,
    ) {
      const { user, info } = await authenticate('graphql-local', { username: name, password });
      if (!user) {
        throw new AuthenticationError(`Failed to login: ${info}`);
      }
      await login(user);
      return user;
    },
    async logout(_: unknown, __: unknown, { logout }: MyContext) {
      try {
        logout();
      } catch {
        return false;
      }
      return true;
    },
    launch(_: unknown, __: unknown, { isAuthenticated, getUser }: MyContext) {
      const user = getUser();
      if (!isAuthenticated() || !user) {
        throw new ForbiddenError('You need to be logged in to access launch mutations');
      }

      if (user.permission !== 'admin') {
        throw new ForbiddenError('You have insufficient privileges for launch mutations');
      }

      return {
        id: 'LAUNCH_MUTATIONS',
      };
    },
  },
  LaunchMutations: {
    add(parent: { id: 'LAUNCH_MUTATIONS' }, { name }: { name: string }, { dataSources: { launchAPI } }: MyContext) {
      const newLaunch = launchAPI.add(name);

      return newLaunch;
    },
  },
};

export default resolvers;
