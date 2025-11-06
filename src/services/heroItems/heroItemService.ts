import { prisma } from "@/lib/prisma";

export interface HeroItemData {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string;
  collectionId: string | null;
  collection?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHeroItemData {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl: string;
  collectionId?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateHeroItemData {
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  collectionId?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export const heroItemService = {
  async getActiveHeroItems(): Promise<HeroItemData[]> {
    const heroItems = await prisma.heroItem.findMany({
      where: {
        isActive: true,
      },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return heroItems;
  },

  async getAllHeroItems(): Promise<HeroItemData[]> {
    const heroItems = await prisma.heroItem.findMany({
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return heroItems;
  },

  async getHeroItemById(id: string): Promise<HeroItemData | null> {
    const heroItem = await prisma.heroItem.findUnique({
      where: { id },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return heroItem;
  },

  async createHeroItem(data: CreateHeroItemData): Promise<HeroItemData> {
    const heroItem = await prisma.heroItem.create({
      data: {
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        collectionId: data.collectionId || null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return heroItem;
  },

  async updateHeroItem(
    id: string,
    data: UpdateHeroItemData
  ): Promise<HeroItemData> {
    const heroItem = await prisma.heroItem.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.linkUrl !== undefined && { linkUrl: data.linkUrl }),
        ...(data.collectionId !== undefined && {
          collectionId: data.collectionId,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return heroItem;
  },

  async deleteHeroItem(id: string): Promise<void> {
    await prisma.heroItem.delete({
      where: { id },
    });
  },

  async reorderHeroItems(
    items: { id: string; sortOrder: number }[]
  ): Promise<void> {
    await prisma.$transaction(
      items.map((item) =>
        prisma.heroItem.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );
  },
};
