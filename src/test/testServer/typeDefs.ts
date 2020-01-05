import { gql } from 'apollo-server';

const typeDefs = gql`
  type Query {
    launch(id: ID!): Launch
    # Queries for the current user
    me: User
  }

  type Mutation {
    login(name: String!, password: String!): Boolean # login token
    launch: LaunchMutations
  }

  type Launch {
    id: ID!
    name: String!
  }

  type LaunchMutations {
    add(name: String!): ID
  }

  type User {
    name: String!
  }
`;

export default typeDefs;
