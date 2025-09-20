import { prisma } from "@/lib/prisma";

export const getCategoriesSSG = async () => {
  let categories: any[] = [];
  try {
    const response = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null, // Only get top-level categories for the homepage
      },
      orderBy: [
        {
          name: "asc",
        },
      ],
      include: {
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
    if (response) {
      categories = response;
    }
  } catch (error) {
    console.log(error);
  }
  return categories;
};

// Also export as default for compatibility
export default getCategoriesSSG;