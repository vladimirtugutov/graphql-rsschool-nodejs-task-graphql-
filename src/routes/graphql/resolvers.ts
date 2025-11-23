import type { PrismaClient, User, Post, Profile, MemberType } from '@prisma/client';

export const resolvers = {
  query: {
    users: async (
      _: unknown,
      __: unknown,
      context: { prisma: PrismaClient }
    ): Promise<User[]> => context.prisma.user.findMany(),

    user: async (
      _: unknown,
      args: { id: string },
      context: { prisma: PrismaClient }
    ): Promise<User | null> =>
      context.prisma.user.findUnique({ where: { id: args.id } }),

    posts: async (
      _: unknown,
      __: unknown,
      context: { prisma: PrismaClient }
    ): Promise<Post[]> => context.prisma.post.findMany(),

    post: async (
      _: unknown,
      args: { id: string },
      context: { prisma: PrismaClient }
    ): Promise<Post | null> =>
      context.prisma.post.findUnique({ where: { id: args.id } }),

    memberTypes: async (
      _: unknown,
      __: unknown,
      context: { prisma: PrismaClient }
    ): Promise<MemberType[]> => context.prisma.memberType.findMany(),

    memberType: async (
      _: unknown,
      args: { id: string },
      context: { prisma: PrismaClient }
    ): Promise<MemberType | null> =>
      context.prisma.memberType.findUnique({ where: { id: args.id } }),

    profiles: async (
      _: unknown,
      __: unknown,
      context: { prisma: PrismaClient }
    ): Promise<Profile[]> => context.prisma.profile.findMany(),

    profile: async (
      _: unknown,
      args: { id: string },
      context: { prisma: PrismaClient }
    ): Promise<Profile | null> =>
      context.prisma.profile.findUnique({ where: { id: args.id } }),
  },

  user: {
    profile: (
      parent: User,
      _: unknown,
      context: { loaders: any }
    ): Promise<(Profile & { memberType: MemberType }) | null> =>
      context.loaders.profileByUserId.load(parent.id),

    posts: (parent: User, _: unknown, context: { loaders: any }): Promise<Post[]> =>
      context.loaders.postsByAuthorId.load(parent.id),

    userSubscribedTo: async (
      parent: User,
      _: unknown,
      context: { prisma: PrismaClient }
    ): Promise<User[]> => {
      const subscriptions = await context.prisma.subscribersOnAuthors.findMany({
        where: { subscriberId: parent.id },
        include: { author: true },
      });
      return subscriptions.map((s) => s.author);
    },

    subscribedToUser: async (
      parent: User,
      _: unknown,
      context: { prisma: PrismaClient }
    ): Promise<User[]> => {
      const subscribers = await context.prisma.subscribersOnAuthors.findMany({
        where: { authorId: parent.id },
        include: { subscriber: true },
      });
      return subscribers.map((s) => s.subscriber);
    },
  },

  profile: {
    memberType: (
      parent: Profile,
      _: unknown,
      context: { loaders: any }
    ): Promise<MemberType | null> => context.loaders.memberTypeById.load(parent.memberTypeId),
  },

  mutation: {
    createUser: async (
      _: unknown,
      args: { dto: { name: string; balance: number } },
      context: { prisma: PrismaClient }
    ): Promise<User> =>
      context.prisma.user.create({
        data: args.dto,
      }),

    changeUser: async (
      _: unknown,
      args: { id: string; dto: Partial<{ name: string; balance: number }> },
      context: { prisma: PrismaClient }
    ): Promise<User> =>
      context.prisma.user.update({
        where: { id: args.id },
        data: args.dto,
      }),

    deleteUser: async (
      _: unknown,
      args: { id: string },
      context: { prisma: PrismaClient }
    ): Promise<boolean> => {
      await context.prisma.user.delete({ where: { id: args.id } });
      return true;
    },

    createPost: async (
      _: unknown,
      args: { dto: { title: string; content: string; authorId: string } },
      context: { prisma: PrismaClient }
    ): Promise<Post> =>
      context.prisma.post.create({
        data: args.dto,
      }),

    changePost: async (
      _: unknown,
      args: { id: string; dto: Partial<{ title: string; content: string }> },
      context: { prisma: PrismaClient }
    ): Promise<Post> =>
      context.prisma.post.update({
        where: { id: args.id },
        data: args.dto,
      }),

    deletePost: async (
      _: unknown,
      args: { id: string },
      context: { prisma: PrismaClient }
    ): Promise<boolean> => {
      await context.prisma.post.delete({ where: { id: args.id } });
      return true;
    },

    createProfile: async (
      _: unknown,
      args: { dto: { userId: string; isMale?: boolean; yearOfBirth?: number; memberTypeId: string } },
      context: { prisma: PrismaClient }
    ): Promise<Profile> =>
      context.prisma.profile.create({
        data: {
          ...args.dto,
          isMale: args.dto.isMale ?? false,
          yearOfBirth: args.dto.yearOfBirth ?? 2000,
        },
      }),

    changeProfile: async (
      _: unknown,
      args: { id: string; dto: Partial<{ userId?: string; isMale?: boolean; yearOfBirth?: number; memberTypeId?: string }> },
      context: { prisma: PrismaClient }
    ): Promise<Profile> => {
      const existing = await context.prisma.profile.findUnique({ where: { id: args.id } });
      if (!existing) {
        throw new Error(`Profile with id=${args.id} not found`);
      }
      return context.prisma.profile.update({
        where: { id: args.id },
        data: {
          ...args.dto,
          isMale: args.dto.isMale ?? existing.isMale,
          yearOfBirth: args.dto.yearOfBirth ?? existing.yearOfBirth,
        },
      });
    },

    deleteProfile: async (
      _: unknown,
      args: { id: string },
      context: { prisma: PrismaClient }
    ): Promise<boolean> => {
      await context.prisma.profile.delete({ where: { id: args.id } });
      return true;
    },

    subscribeTo: async (
      _: unknown,
      args: { userId: string; authorId: string },
      context: { prisma: PrismaClient }
    ): Promise<boolean> => {
      await context.prisma.subscribersOnAuthors.create({
        data: {
          subscriberId: args.userId,
          authorId: args.authorId,
        },
      });
      return true;
    },

    unsubscribeFrom: async (
      _: unknown,
      args: { userId: string; authorId: string },
      context: { prisma: PrismaClient }
    ): Promise<boolean> => {
      await context.prisma.subscribersOnAuthors.delete({
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
