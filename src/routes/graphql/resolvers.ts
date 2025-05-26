import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const resolvers = {
  query: {
    users: async () => prisma.user.findMany(),
    user: async (_: any, args: { id: string }) =>
      prisma.user.findUnique({ where: { id: args.id } }),

    posts: async () => prisma.post.findMany(),
    post: async (_: any, args: { id: string }) =>
      prisma.post.findUnique({ where: { id: args.id } }),

    memberTypes: async () => prisma.memberType.findMany(),
    memberType: async (_: any, args: { id: string }) =>
      prisma.memberType.findUnique({ where: { id: args.id } }),

    profiles: async () => prisma.profile.findMany(),
    profile: async (_: any, args: { id: string }) =>
      prisma.profile.findUnique({ where: { id: args.id } }),
  },

  user: {
    // profile: async (parent: any) => {
    //   return prisma.profile.findUnique({
    //     where: { userId: parent.id },
    //   });
    // },
    profile: async (parent: any) => {
      return prisma.profile.findUnique({
        where: { userId: parent.id },
        include: { memberType: true }, // <== это загружает всю вложку, если нужно
      });
    },
    posts: async (parent: any) => {
      return prisma.post.findMany({ where: { authorId: parent.id } });
    },
    userSubscribedTo: async (parent: any) => {
      const subscriptions = await prisma.subscribersOnAuthors.findMany({
        where: { subscriberId: parent.id },
        include: { author: true },
      });
      return subscriptions.map((s) => s.author);
    },
    subscribedToUser: async (parent: any) => {
      const subscribers = await prisma.subscribersOnAuthors.findMany({
        where: { authorId: parent.id },
        include: { subscriber: true },
      });
      return subscribers.map((s) => s.subscriber);
    },
  },

  profile: {
    memberType: async (parent: any) => {
      console.log('[DEBUG] profile.memberType parent:', parent);
      return prisma.memberType.findUnique({
        where: { id: parent.memberTypeId },
      });
    },
  },

  mutation: {
    createUser: async (_: any, args: { name: string; balance: number }) => {
      return prisma.user.create({
        data: {
          name: args.name,
          balance: args.balance,
        },
      });
    },
    createPost: async (_: any, args: { title: string; content: string; authorId: string }) => {
      return prisma.post.create({
        data: {
          title: args.title,
          content: args.content,
          authorId: args.authorId,
        },
      });
    },
    subscribe: async (_: any, args: { authorId: string; subscriberId: string }) => {
      return prisma.subscribersOnAuthors.create({
        data: {
          authorId: args.authorId,
          subscriberId: args.subscriberId,
        },
      });
    },
  },
};
