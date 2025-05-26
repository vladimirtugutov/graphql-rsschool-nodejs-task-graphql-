import { PrismaClient, User, Post, Profile, MemberType } from '@prisma/client';
import { GraphQLResolveInfo } from 'graphql';

const prisma = new PrismaClient();

export const resolvers = {
  query: {
    users: async (): Promise<User[]> => prisma.user.findMany(),

    user: async (
      _: unknown,
      args: { id: string },
      __: unknown,
      ___: GraphQLResolveInfo
    ): Promise<User | null> => prisma.user.findUnique({ where: { id: args.id } }),

    posts: async (): Promise<Post[]> => prisma.post.findMany(),

    post: async (
      _: unknown,
      args: { id: string }
    ): Promise<Post | null> => prisma.post.findUnique({ where: { id: args.id } }),

    memberTypes: async (): Promise<MemberType[]> => prisma.memberType.findMany(),

    memberType: async (
      _: unknown,
      args: { id: string }
    ): Promise<MemberType | null> =>
      prisma.memberType.findUnique({ where: { id: args.id } }),

    profiles: async (): Promise<Profile[]> => prisma.profile.findMany(),

    profile: async (
      _: unknown,
      args: { id: string }
    ): Promise<Profile | null> =>
      prisma.profile.findUnique({ where: { id: args.id } }),
  },

  user: {
    profile: async (parent: User): Promise<(Profile & { memberType: MemberType }) | null> =>
      prisma.profile.findUnique({
        where: { userId: parent.id },
        include: { memberType: true },
      }),

    posts: async (parent: User): Promise<Post[]> =>
      prisma.post.findMany({ where: { authorId: parent.id } }),

    userSubscribedTo: async (parent: User): Promise<User[]> => {
      const subscriptions = await prisma.subscribersOnAuthors.findMany({
        where: { subscriberId: parent.id },
        include: { author: true },
      });
      return subscriptions.map((s) => s.author);
    },

    subscribedToUser: async (parent: User): Promise<User[]> => {
      const subscribers = await prisma.subscribersOnAuthors.findMany({
        where: { authorId: parent.id },
        include: { subscriber: true },
      });
      return subscribers.map((s) => s.subscriber);
    },
  },

  profile: {
    memberType: async (parent: Profile): Promise<MemberType | null> =>
      prisma.memberType.findUnique({
        where: { id: parent.memberTypeId },
      }),
  },

  mutation: {
    createUser: async (
      _: unknown,
      args: { name: string; balance: number }
    ): Promise<User> =>
      prisma.user.create({
        data: {
          name: args.name,
          balance: args.balance,
        },
      }),

    createPost: async (
      _: unknown,
      args: { title: string; content: string; authorId: string }
    ): Promise<Post> =>
      prisma.post.create({
        data: {
          title: args.title,
          content: args.content,
          authorId: args.authorId,
        },
      }),

    subscribe: async (
      _: unknown,
      args: { authorId: string; subscriberId: string }
    ): Promise<User> => {
      await prisma.subscribersOnAuthors.create({
        data: {
          authorId: args.authorId,
          subscriberId: args.subscriberId,
        },
      });
      return prisma.user.findUniqueOrThrow({ where: { id: args.subscriberId } });
    },
  },
};
