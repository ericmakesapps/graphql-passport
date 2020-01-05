import { gql } from 'apollo-server';

const typeDefs = gql`
  type Query {
    # User has to be authenticated to get access to these
    launch: LaunchQueries
    # Queries for the current user
    me: User
    # Just a plain server version query without any access restrictions
    version: String!
  }

  type Mutation {
    login(name: String!, password: String!): Boolean # login token
    # User has to be of admin type fo have access to these
    launch: LaunchMutations
  }

  type LaunchQueries {
    find(id: ID!): Launch
  }

  type Launch {
    id: ID!
    name: String!
  }

  type LaunchMutations {
    add(name: String!): Launch
  }

  type User {
    name: String!
  }
`;

export default typeDefs;
