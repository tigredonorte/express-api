import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  type Status {
    _id: ID!
    status: String!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    email: String!
    name: String!
    password: String
  }

  input SignupInputData {
    email: String!
    name: String!
    password: String!
    confirm_password: String!
  }

  type SignupResponse {
    token: String!
    user: User!
  }

  input LoginInputData {
    email: String!
    password: String!
  }

  type LoginResponse {
    token: String!
    userId: String!
  }

  type Post {
    _id: ID!
    title: String!
    content: String!
    image: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  input PostInputData {
    title: String!
    content: String!
  }

  type ListPostsResponse {
    posts: [Post]!
    total: Int!
    pageCount: Int!
    itemsPerPage: Int!
  }

  type RootMutation {
    signup(userInput: SignupInputData): SignupResponse!
    createPost(postData: PostInputData): Post!
    editPost(postId: String!, postData: PostInputData): Post!
    deletePost(postId: String!): Boolean
  }

  type RootQuery {
    login(userInput: LoginInputData): LoginResponse!
    listPosts(page: Int!): ListPostsResponse
    getPost(postId: String!): Post!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
