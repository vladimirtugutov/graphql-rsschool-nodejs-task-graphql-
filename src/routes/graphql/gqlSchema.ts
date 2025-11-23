import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLFieldResolver,
} from 'graphql';
import { PrismaClient, User, MemberType as MemberTypeModel } from '@prisma/client';
import { resolvers } from './resolvers.js';
import { UUID, MemberTypeId } from './scalars.js';
import { createLoaders } from './dataloaders.js';

type GqlContext = {
  prisma: PrismaClient;
  loaders: ReturnType<typeof createLoaders>;
};

type Resolver<TSource, TArgs = {}, TResult = any> = GraphQLFieldResolver<
  TSource,
  GqlContext,
  TArgs,
  TResult
>;

const MemberType = new GraphQLObjectType<MemberTypeModel, GqlContext>({
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
      resolve: resolvers.profile.memberType as Resolver<any>,
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

const UserType = new GraphQLObjectType<User, GqlContext>({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUID) },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: ProfileType,
      resolve: resolvers.user.profile as Resolver<User>,
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: resolvers.user.posts as Resolver<User>,
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: resolvers.user.userSubscribedTo as Resolver<User>,
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: resolvers.user.subscribedToUser as Resolver<User>,
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

const QueryType = new GraphQLObjectType<any, GqlContext>({
  name: 'Query',
  fields: () => ({
    users: {
      type: new GraphQLList(UserType),
      resolve: resolvers.query.users as Resolver<any>,
    },
    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(UUID) } },
      resolve: resolvers.query.user as Resolver<any, { id: string }>,
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: resolvers.query.posts as Resolver<any>,
    },
    post: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(UUID) } },
      resolve: resolvers.query.post as Resolver<any, { id: string }>,
    },
    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: resolvers.query.memberTypes as Resolver<any>,
    },
    memberType: {
      type: MemberType,
      args: { id: { type: new GraphQLNonNull(MemberTypeId) } },
      resolve: resolvers.query.memberType as Resolver<any, { id: string }>,
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: resolvers.query.profiles as Resolver<any>,
    },
    profile: {
      type: ProfileType,
      args: { id: { type: new GraphQLNonNull(UUID) } },
      resolve: resolvers.query.profile as Resolver<any, { id: string }>,
    },
  }),
});

const MutationType = new GraphQLObjectType<any, GqlContext>({
  name: 'Mutation',
  fields: () => ({
    createUser: {
      type: UserType,
      args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
      resolve: resolvers.mutation.createUser as Resolver<any, { dto: any }>,
    },
    createPost: {
      type: PostType,
      args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
      resolve: resolvers.mutation.createPost as Resolver<any, { dto: any }>,
    },
    createProfile: {
      type: ProfileType,
      args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
      resolve: resolvers.mutation.createProfile as Resolver<any, { dto: any }>,
    },
    changeUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUID) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: resolvers.mutation.changeUser as Resolver<any, { id: string; dto: any }>,
    },
    changePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUID) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: resolvers.mutation.changePost as Resolver<any, { id: string; dto: any }>,
    },
    changeProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUID) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: resolvers.mutation.changeProfile as Resolver<any, { id: string; dto: any }>,
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUID) } },
      resolve: resolvers.mutation.deleteUser as Resolver<any, { id: string }>,
    },
    deletePost: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUID) } },
      resolve: resolvers.mutation.deletePost as Resolver<any, { id: string }>,
    },
    deleteProfile: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUID) } },
      resolve: resolvers.mutation.deleteProfile as Resolver<any, { id: string }>,
    },
    subscribeTo: {
      type: GraphQLBoolean,
      args: {
        userId: { type: new GraphQLNonNull(UUID) },
        authorId: { type: new GraphQLNonNull(UUID) },
      },
      resolve: resolvers.mutation.subscribeTo as Resolver<any, { userId: string; authorId: string }>,
    },
    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: {
        userId: { type: new GraphQLNonNull(UUID) },
        authorId: { type: new GraphQLNonNull(UUID) },
      },
      resolve: resolvers.mutation.unsubscribeFrom as Resolver<any, { userId: string; authorId: string }>,
    },
  }),
});

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  types: [UUID, MemberTypeId],
});
