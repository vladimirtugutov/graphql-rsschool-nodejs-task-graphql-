import DataLoader from 'dataloader';
import { PrismaClient, Post, Profile, MemberType, User } from '@prisma/client';

export function createLoaders(prisma: PrismaClient) {
  return {
    postsByAuthorId: new DataLoader<string, Post[]>(async (authorIds) => {
      const posts = await prisma.post.findMany({
        where: { authorId: { in: authorIds as string[] } },
      });
      return authorIds.map((id) => posts.filter((p) => p.authorId === id));
    }),

    profileByUserId: new DataLoader<string, Profile | null>(async (userIds) => {
      const profiles = await prisma.profile.findMany({
        where: { userId: { in: userIds as string[] } },
      });
      return userIds.map((id) => profiles.find((p) => p.userId === id) ?? null);
    }),

    memberTypeById: new DataLoader<string, MemberType | null>(async (ids) => {
      const types = await prisma.memberType.findMany({
        where: { id: { in: ids as string[] } },
      });
      return ids.map((id) => types.find((t) => t.id === id) ?? null);
    }),

    subsBySubscriberId: new DataLoader<string, User[]>(async (subscriberIds) => {
      const records = await prisma.subscribersOnAuthors.findMany({
        where: { subscriberId: { in: subscriberIds as string[] } },
        include: { author: true },
      });
      return subscriberIds.map((id) =>
        records.filter((r) => r.subscriberId === id).map((r) => r.author)
      );
    }),

    subsByAuthorId: new DataLoader<string, User[]>(async (authorIds) => {
      const records = await prisma.subscribersOnAuthors.findMany({
        where: { authorId: { in: authorIds as string[] } },
        include: { subscriber: true },
      });
      return authorIds.map((id) =>
        records.filter((r) => r.authorId === id).map((r) => r.subscriber)
      );
    }),
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
