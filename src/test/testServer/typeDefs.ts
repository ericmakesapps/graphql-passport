import { gql } from 'apollo-server';

const typeDefs = gql`
  type Query {
    """
    User has to be authenticated to get access to these
    """
    launch: LaunchQueries

    """
    Queries for the current user
    """
    me: User

    """
    Just a plain server version query without any access restrictions
    """
    version: String!
  }

  type Mutation {
    """
    Login user

    Failed logins throw AuthenticationError
    """
    login(name: String!, password: String!): User!

    """
    Logout current user
    """
    logout: Boolean

    """
    User has to be of admin type fo have access to these
    """
    launch: LaunchMutations
  }

  type LaunchQueries {
    """
    Find launc
    """
    find(id: ID!): Launch
  }

  type Launch {
    """
    The id
    """
    id: ID!

    """
    The descriptor
    """
    name: String!
  }

  type LaunchMutations {
    """
    Add a launch event
    """
    add(name: String!): Launch
  }

  type User {
    """
    The user's name
    """
    name: String!
  }
`;

export default typeDefs;
