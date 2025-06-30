import { prisma } from "@/lib/prisma";

export const getNewArrivalsSSG = async () => {
  let products: any[] = [];
  try {
    const response = await prisma.newArrivals.findMany({
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });
    if (response) {
      products = response;
    }
  } catch (error) {
    console.log(error);
  }
  return products;
};

// Also export as default for compatibility
export default getNewArrivalsSSG;
