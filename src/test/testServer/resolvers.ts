import { ForbiddenError } from 'apollo-server';
import { MyContext } from './MyContext';

const resolvers = {
  Query: {
    launch: (_: unknown, { id }: { id: string }, { dataSources: { launchAPI } }: MyContext) => launchAPI.find(id),
    me: (_: unknown, __: unknown, { getUser }: MyContext) => {
      return getUser();
    },
  },
  Mutation: {
    async login(
      _: unknown,
      { name, password }: { name: string; password: string },
      { authenticate, login }: MyContext,
    ) {
      const { user } = await authenticate('graphql-local', { username: name, password });
      await new Promise(resolve => login(user, () => resolve()));
      return !!user;
    },
    launch() {
      return {
        id: 'LAUNCH',
      };
    },
  },
  LaunchMutations: {
    add() {
      throw new ForbiddenError('Not implemented');
    },
  },
};

export default resolvers;
