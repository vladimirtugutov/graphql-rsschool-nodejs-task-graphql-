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
      args: { dto: { name: string; balance: number } }
    ): Promise<User> =>
      prisma.user.create({
        data: args.dto,
      }),

    changeUser: async (
      _: unknown,
      args: { id: string; dto: Partial<{ name: string; balance: number }> }
    ): Promise<User> =>
      prisma.user.update({
        where: { id: args.id },
        data: args.dto,
      }),

    deleteUser: async (
      _: unknown,
      args: { id: string }
    ): Promise<boolean> => {
      await prisma.user.delete({ where: { id: args.id } });
      return true;
    },

    createPost: async (
      _: unknown,
      args: { dto: { title: string; content: string; authorId: string } }
    ): Promise<Post> =>
      prisma.post.create({
        data: args.dto,
      }),

    changePost: async (
      _: unknown,
      args: { id: string; dto: Partial<{ title: string; content: string }> }
    ): Promise<Post> =>
      prisma.post.update({
        where: { id: args.id },
        data: args.dto,
      }),

    deletePost: async (
      _: unknown,
      args: { id: string }
    ): Promise<boolean> => {
      await prisma.post.delete({ where: { id: args.id } });
      return true;
    },

    createProfile: async (
      _: unknown,
      args: { dto: { userId: string; isMale?: boolean; yearOfBirth?: number; memberTypeId: string } }
    ): Promise<Profile> =>
      prisma.profile.create({
        data: {
          ...args.dto,
          isMale: args.dto.isMale ?? false,
          yearOfBirth: args.dto.yearOfBirth ?? 2000,
        },
      }),

    changeProfile: async (
      _: unknown,
      args: { id: string; dto: Partial<{ userId: string; isMale?: boolean; yearOfBirth?: number; memberTypeId?: string }> }
    ): Promise<Profile> =>
      prisma.profile.update({
        where: { id: args.id },
        data: {
          ...args.dto,
          isMale: args.dto.isMale ?? false,
          yearOfBirth: args.dto.yearOfBirth ?? 2000,
        },
      }),

    deleteProfile: async (
      _: unknown,
      args: { id: string }
    ): Promise<boolean> => {
      await prisma.profile.delete({ where: { id: args.id } });
      return true;
    },

    subscribeTo: async (
      _: unknown,
      args: { userId: string; authorId: string }
    ): Promise<boolean> => {
      await prisma.subscribersOnAuthors.create({
        data: {
          subscriberId: args.userId,
          authorId: args.authorId,
        },
      });
      return true;
    },

    unsubscribeFrom: async (
      _: unknown,
      args: { userId: string; authorId: string }
    ): Promise<boolean> => {
      await prisma.subscribersOnAuthors.delete({
        where: {
          subscriberId_authorId: {
            subscriberId: args.userId,
            authorId: args.authorId,
          },
        },
      });
      return true;
    },
  },
};
