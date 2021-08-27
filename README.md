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

For a full working example including detailed instructions visit this blog post about [how to authenticate with user credentials using GraphQL and passport](https://jkettmann.com/authentication-and-authorization-with-graphql-and-passport). Continue reading here for a short summary.

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

Inside your resolvers you can call `context.authenticate` to authenticate the user with the given credentials. If you want to use `express-session` as well you need to call `context.login(user)` after `authenticate`.

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
import { GraphQLLocalStrategy, buildContext, createOnConnect } from 'graphql-passport';

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

## Typescript

This library cannot know what fields the user type contains in a given project. In order to define your own `Context` type you must provide your user type to the `PassportContext`/`PassportSubscriptionContext` generic parameter.

### Creating a simple context

First, we need to define the user type. In this example the type is defined in a file called `MyUser.ts` and has the fields `firstName` and `lastName`.

```ts
export type MyUser = {
  firstName: string;
  lastName: string;
}
```

We can now define the context interface specific to the project. We use the above user type in place of the generic for the `PassportContext` and `PassportSubscriptionContext` interfaces. For this example we create a file named `MyContext.ts` with following content.

```ts
import { Request as ExpressRequest } from 'express';
import { PassportSubscriptionContext, PassportContext } from 'graphql-passport';
import { MyUser } = './path/to/MyUser';

export interface MyContext extends PassportContext<MyUser, ExpressRequest>{}

export interface ProjectSubscriptionContext extends PassportSubscriptionContext<MyUser, ExpressRequest>{}
```

### Using the context type in the resolvers

The `MyContext` type can now be used inside the resolvers. Below you can see an example of a resolver that concatenates the user's first and last name defined above.

```ts
import { MyContext } from './path/to/MyContext';

const resolvers = {
  Query: {
    User: {
      name: (parent: unknown, data: SomeData, context: MyContext) => {
        const user = context.getUser();
        return `${user.firstName} ${user.lastName}`;
      },
    },
  },
};
```

### Working with data sources

If you use [Apollo's data sources](https://www.apollographql.com/docs/apollo-server/data/data-sources/) you might want to add `dataSources` to the interface. This can be achieved as follows.

```ts
import { Request as ExpressRequest } from 'express';
import { PassportSubscriptionContext, PassportContext } from 'graphql-passport';
import { MyUser } = './path/to/MyUser';

export interface MyContext extends PassportContext<MyUser, ExpressRequest>{
  dataSources: {
    myOtherAPI: { ... }
  }
}

export interface ProjectSubscriptionContext extends PassportSubscriptionContext<MyUser, ExpressRequest>{
  dataSources: {
    myOtherAPI: { ... }
  }
}
```
