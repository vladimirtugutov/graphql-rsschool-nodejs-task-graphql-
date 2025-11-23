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
import { PrismaClient, User, MemberType as MemberTypeModel, Profile } from '@prisma/client';
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

const ProfileType = new GraphQLObjectType<Profile, GqlContext>({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUID) },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberType: {
      type: MemberType,
      resolve: resolvers.profile.memberType as Resolver<Profile>,
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

const QueryType = new GraphQLObjectType<unknown, GqlContext>({
  name: 'Query',
  fields: () => ({
    users: {
      type: new GraphQLList(UserType),
      resolve: resolvers.query.users as Resolver<unknown>,
    },
    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(UUID) } },
      resolve: resolvers.query.user as Resolver<unknown, { id: string }>,
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: resolvers.query.posts as Resolver<unknown>,
    },
    post: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(UUID) } },
      resolve: resolvers.query.post as Resolver<unknown, { id: string }>,
    },
    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: resolvers.query.memberTypes as Resolver<unknown>,
    },
    memberType: {
      type: MemberType,
      args: { id: { type: new GraphQLNonNull(MemberTypeId) } },
      resolve: resolvers.query.memberType as Resolver<unknown, { id: string }>,
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: resolvers.query.profiles as Resolver<unknown>,
    },
    profile: {
      type: ProfileType,
      args: { id: { type: new GraphQLNonNull(UUID) } },
      resolve: resolvers.query.profile as Resolver<unknown, { id: string }>,
    },
  }),
});

const MutationType = new GraphQLObjectType<unknown, GqlContext>({
  name: 'Mutation',
  fields: () => ({
    createUser: {
      type: UserType,
      args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
      resolve: resolvers.mutation.createUser as Resolver<unknown, { dto: any }>,
    },
    createPost: {
      type: PostType,
      args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
      resolve: resolvers.mutation.createPost as Resolver<unknown, { dto: any }>,
    },
    createProfile: {
      type: ProfileType,
      args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
      resolve: resolvers.mutation.createProfile as Resolver<unknown, { dto: any }>,
    },
    changeUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUID) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: resolvers.mutation.changeUser as Resolver<unknown, { id: string; dto: any }>,
    },
    changePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUID) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: resolvers.mutation.changePost as Resolver<unknown, { id: string; dto: any }>,
    },
    changeProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUID) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: resolvers.mutation.changeProfile as Resolver<unknown, { id: string; dto: any }>,
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUID) } },
      resolve: resolvers.mutation.deleteUser as Resolver<unknown, { id: string }>,
    },
    deletePost: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUID) } },
      resolve: resolvers.mutation.deletePost as Resolver<unknown, { id: string }>,
    },
    deleteProfile: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(UUID) } },
      resolve: resolvers.mutation.deleteProfile as Resolver<unknown, { id: string }>,
    },
    subscribeTo: {
      type: GraphQLBoolean,
      args: {
        userId: { type: new GraphQLNonNull(UUID) },
        authorId: { type: new GraphQLNonNull(UUID) },
      },
      resolve: resolvers.mutation.subscribeTo as Resolver<unknown, { userId: string; authorId: string }>,
    },
    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: {
        userId: { type: new GraphQLNonNull(UUID) },
        authorId: { type: new GraphQLNonNull(UUID) },
      },
      resolve: resolvers.mutation.unsubscribeFrom as Resolver<unknown, { userId: string; authorId: string }>,
    },
  }),
});

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  types: [UUID, MemberTypeId],
});
