import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLFloat,
} from 'graphql';
import { resolvers } from './resolvers.js';
import { UUID, MemberTypeId } from './scalars.js';

// MemberType
const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUID) },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  }),
});

// Profile
const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUID) },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberType: {
      type: MemberType,
      resolve: resolvers.profile.memberType,
    },
  }),
});

// Post
const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUID) },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});

// User
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUID) },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: { type: ProfileType, resolve: resolvers.user.profile },
    posts: { type: new GraphQLList(PostType), resolve: resolvers.user.posts },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: resolvers.user.userSubscribedTo,
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: resolvers.user.subscribedToUser,
    },
  }),
});

// Root Query
const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    users: {
      type: new GraphQLList(UserType),
      resolve: resolvers.query.users,
    },
    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(UUID) } },
      resolve: resolvers.query.user,
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: resolvers.query.posts,
    },
    post: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(UUID) } },
      resolve: resolvers.query.post,
    },
    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: resolvers.query.memberTypes,
    },
    memberType: {
      type: MemberType,
      args: { id: { type: new GraphQLNonNull(MemberTypeId) } },
      resolve: resolvers.query.memberType,
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: resolvers.query.profiles,
    },
    profile: {
      type: ProfileType,
      args: { id: { type: new GraphQLNonNull(UUID) } },
      resolve: resolvers.query.profile,
    },
  }),
});

// Root Mutation
const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
      },
      resolve: resolvers.mutation.createUser,
    },
    createPost: {
      type: PostType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(UUID) },
      },
      resolve: resolvers.mutation.createPost,
    },
    subscribeTo: {
      type: UserType,
      args: {
        authorId: { type: new GraphQLNonNull(UUID) },
        subscriberId: { type: new GraphQLNonNull(UUID) },
      },
      resolve: resolvers.mutation.subscribe,
    },
  }),
});

// Debug: print registered resolver keys
console.log('[DEBUG] resolvers.query keys:', Object.keys(resolvers.query || {}));
console.log('[DEBUG] resolvers.user keys:', Object.keys(resolvers.user || {}));
console.log('[DEBUG] resolvers.profile keys:', Object.keys(resolvers.profile || {}));

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  types: [UUID, MemberTypeId],
});
