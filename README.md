`graphql-passport` provides simple functionality to authenticate with Passport.js from mutation resolvers.

Inside your resolvers you can get access to the following functions and attributes inside the context.

```js
context.authenticate("graphql-local", { email, password }); // not available for subscriptions
context.login(user); // not available for subscriptions
context.logout(); // not available for subscriptions
context.isAuthenticated();
context.isUnauthenticated();
context.getUser();
```

`authenticate` and `login` are basically `passport.authenticate` and `passport.login` wrapped in a promise. `user`, `logout`, `isAuthenticated` and `isUnauthenticated` are just copies of the corresponding passport functions and attributes.

## Usage

For a full working example including detailed instructions visit this blog post about [how to authenticate with user credentials using GraphQL and passport](https://jkettmann.com/authentication-with-credentials-using-graphql-and-passport/). Continue reading here for a short summary.

Initialize the `GraphQLLocalStrategy` and create the GraphQL context by using `buildContext`.

```js
import express from "express";
import session from "express-session";
import { ApolloServer } from "apollo-server-express";
import passport from "passport";
import { GraphQLLocalStrategy, buildContext } from "graphql-passport";

passport.use(
  new GraphQLLocalStrategy((email, password, done) => {
    // Adjust this callback to your needs
    const users = User.getUsers();
    const matchingUser = users.find(
      user => email === user.email && password === user.password
    );
    const error = matchingUser ? null : new Error("no matching user");
    done(error, matchingUser);
  })
);

const app = express();
app.use(session(options)); // optional
app.use(passport.initialize());
app.use(passport.session()); // if session is used

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => buildContext({ req, res, User })
});

server.applyMiddleware({ app, cors: false });

app.listen({ port: PORT }, () => {
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
});
```

If you need to pass the `request` object into `GraphQLLocalStrategy`, you can pass the `passReqToCallback` option in an object as the first argument, then add it as the first argument of the verify function:

```js
passport.use(
  new GraphQLLocalStrategy( { passReqToCallback: true }, (req, email, password, done) => {
    // access the request object
    const host = req.headers.host;
    ...
  })
);
```

Inside your resolvers you can call `context.authenticate` to authenticate the user with the given credentials. If you want to use `expression-session` as well you need to call `context.login(user)` after `authenticate`.

```js
const resolvers = {
  Query: {
    currentUser: (parent, args, context) => context.getUser()
  },
  Mutation: {
    login: async (parent, { email, password }, context) => {
      // instead of email you can pass username as well
      const { user, info } = await context.authenticate("graphql-local", {
        email,
        password
      });

      // only required if express-session is used
      context.login(user);

      return { user };
    }
  }
};
```

## Usage with subscriptions

When using subscriptions you may want to only expose events related to the currently logged in user. Since subscriptions use websockets they don't pass the session and Passport middlewares like queries or mutations. To be able to access the user object from the context inside the subscription resolvers you need to do some additional work.

```js
import express from 'express';
import session from 'express-session';
import { ApolloServer } from 'apollo-server-express';
import passport from 'passport';
import { GraphQLLocalStrategy, buildContext } from 'graphql-passport';

...
const sessionMiddleware = session(options); // optional
const passportMiddleware = passport.initialize();
const passportSessionMiddleware = passport.session(); // if session is used

const app = express();
app.use(sessionMiddleware);
app.use(passportMiddleware);
app.use(passportSessionMiddleware);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => buildContext({ req, res, User }),
  subscriptions: {
    onConnect: createOnConnect([
      sessionMiddleware,
      passportMiddleware,
      passportSessionMiddleware,
    ])
  }
});

...
```

Now you can access `isAuthenticated()`, `isUnauthenticated()`, and `getUser()` on the context. Follwing example only allows a connection when the user is logged in. It only notifies the user if they are the receiver of the message.

```js
const resolvers = {
  Subscription: {
    messageReceived: {
      subscribe: withFilter(
        (parent, args, context) => {
          if (context.isUnauthenticated()) {
            throw new Error('You need to be logged in');
          }
          return pubSub.asyncIterator([MESSAGE_RECEIVED])
        },
        (payload, variables, context) => payload.messageReceived.receiverId === context.user.id,
      ),
    },
  },
  Query: { ... },
  Mutation: {
    ...
    sendMessage: (parent, { text, receiverId }, context) => {
      const message = { text, receiverId };
      pubSub.publish(MESSAGE_RECEIVED, { messageReceived: message });
      return message;
    }
  },
};
```

# Typescript

As the library cannot know the structure of your user object you need to add this to the global scope by writing your own "somename.d.ts" you can add how your context definition should look like:

```ts
import { Request as ExpressRequest } from 'express';
import { PassportSubscriptionContext, PassportContext } from 'graphql-passport';
import { MyUserObject } = 'some_user_file';

export interface MyContext extends PassportContext<MyUserObject, ExpressRequest>{
  dataSources: {
    myOtherAPI: { ... }
  }
}

export interface MySubscriptionContext extends PassportSubscriptionContext<MyUserObject, ExpressRequest>{
  dataSources: {
    myOtherAPI: { ... }
  }
}
```

In your GraphQL functions you can the reference the passport context using:

```ts
import { MyContext } from 'somename';

const something = async (
  parent: unknown,
  data: SomeData,
  context: MyContext
) => {
  const username = context.getUser()?.name || "guest";

  logger.info(`${username} is accessing 'something'`);
  ...
};
```

# Testing

For a full Apollo server example using [supertest](https://www.npmjs.com/package/supertest) you can find the implemeation under `src/test/testServer`. There is also the ['apollo-server-testing'](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-testing) that allows you to setup a testing server where you can provide your own context mocks:

```ts
const myTestServer = new ApolloServer({
  typeDefs,
  // FakeContext
  context: () => ({
    getUser: () => undefined,
    isAuthenticated: () => false,
    authenticate: () => ({ id: 'mock-user', name: 'John Doe' }),
  }),
  resolvers,
});

const client = createTestClient(myTestServer);
const res = await client.query({ query });
```

If you use the `dataSource` API option you have a powerful approach to testing your endpoints without the overweight introduced using the `supertest` approach.
