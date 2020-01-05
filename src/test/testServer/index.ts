import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import session from 'express-session';
import setupPassport from './setupPassport';
import { buildContext } from '../../index';
import { UserAPI } from './UserAPI';
import { LaunchAPI } from './LaunchAPI';
import { MyDataSources } from './MyContext';
import resolvers from './resolvers';
import typeDefs from './typeDefs';

const app = express();
app.use(
  session({
    secret: 'keyboard cat',
  }),
);

const passport = setupPassport();
app.use(passport.initialize());
app.use(passport.session());

// Silly but required that dataSources is mapped
type MappedType<T> = {
  [P in keyof T]: T[P];
};

const server = new ApolloServer({
  resolvers,
  typeDefs,
  dataSources: () => ({ userAPI: UserAPI.getInstance(), launchAPI: new LaunchAPI() } as MappedType<MyDataSources>),
  context: buildContext,
});

server.applyMiddleware({ app, cors: false });

export default app;
