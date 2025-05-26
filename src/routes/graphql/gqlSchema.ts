import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLFloat,
  GraphQLInputObjectType
} from 'graphql';
import { resolvers } from './resolvers.js';
import { UUID, MemberTypeId } from './scalars.js';

const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUID) },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  }),
});

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

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUID) },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});

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

const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});

const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUID) },
  },
});

const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    userId: { type: new GraphQLNonNull(UUID) },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeId) },
  },
});

const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});

const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});

const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    userId: { type: UUID },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeId },
  },
});

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

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createUser: {
      type: UserType,
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInput) },
      },
      resolve: resolvers.mutation.createUser,
    },
    createPost: {
      type: PostType,
      args: {
        dto: { type: new GraphQLNonNull(CreatePostInput) },
      },
      resolve: resolvers.mutation.createPost,
    },
    createProfile: {
      type: ProfileType,
      args: {
        dto: { type: new GraphQLNonNull(CreateProfileInput) },
      },
      resolve: resolvers.mutation.createProfile,
    },
    changeUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUID) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: resolvers.mutation.changeUser,
    },
    changePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUID) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: resolvers.mutation.changePost,
    },
    changeProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUID) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: resolvers.mutation.changeProfile,
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(UUID) },
      },
      resolve: resolvers.mutation.deleteUser,
    },
    deletePost: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(UUID) },
      },
      resolve: resolvers.mutation.deletePost,
    },
    deleteProfile: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(UUID) },
      },
      resolve: resolvers.mutation.deleteProfile,
    },
    subscribeTo: {
      type: GraphQLBoolean,
      args: {
        userId: { type: new GraphQLNonNull(UUID) },
        authorId: { type: new GraphQLNonNull(UUID) },
      },
      resolve: resolvers.mutation.subscribeTo,
    },
    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: {
        userId: { type: new GraphQLNonNull(UUID) },
        authorId: { type: new GraphQLNonNull(UUID) },
      },
      resolve: resolvers.mutation.unsubscribeFrom,
    },
  }),
});

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  types: [UUID, MemberTypeId],
});
