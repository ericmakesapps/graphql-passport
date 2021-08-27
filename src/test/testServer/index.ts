import { ApolloServer } from 'apollo-server-express';
import express, { Express } from 'express';
import session from 'express-session';
import { agent } from 'supertest';
import setupPassport from './setupPassport';
import { buildContext } from '../../index';
import { UserAPI } from './UserAPI';
import { LaunchAPI } from './LaunchAPI';
import { MyDataSources } from './MyContext';
import resolvers from './resolvers';
import typeDefs from './typeDefs';

jest.unmock('passport');

export const startServer = async (): Promise<Express> => {
  const app = express();
  app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
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

  await server.start();

  server.applyMiddleware({ app, cors: false });

  return app;
};

export const getServerAgent = async () => {
  const server = await startServer();
  return agent(server);
};
