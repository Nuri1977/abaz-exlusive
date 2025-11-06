import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedHeroItems = async () => {
  console.log("Seeding hero items...");

  const heroItems = [
    {
      title: "Discover the New Collection",
      description: "Premium women's shoes for every occasion.",
      imageUrl: "/images/hero_01.jpg",
      linkUrl: "/products/new-arrivals",
      sortOrder: 1,
      isActive: true,
    },
    {
      title: "Elegance in Every Step",
      description: "Find the perfect pair of heels for your next event.",
      imageUrl: "/images/hero_02.jpg",
      linkUrl: "/products/heels",
      sortOrder: 2,
      isActive: true,
    },
    {
      title: "Summer-Ready Sandals",
      description: "Step into summer with our latest collection of sandals.",
      imageUrl: "/images/hero_03.jpg",
      linkUrl: "/products/sandals",
      sortOrder: 3,
      isActive: true,
    },
    {
      title: "Comfort Meets Style",
      description: "Explore our range of comfortable and stylish sneakers.",
      imageUrl: "/images/hero_04.jpg",
      linkUrl: "/products/sneakers",
      sortOrder: 4,
      isActive: true,
    },
    {
      title: "Bold & Beautiful Boots",
      description: "Make a statement with our collection of boots.",
      imageUrl: "/images/hero_05.jpg",
      linkUrl: "/products/boots",
      sortOrder: 5,
      isActive: true,
    },
  ];

  for (const item of heroItems) {
    // Check if item already exists by title
    const existingItem = await prisma.heroItem.findFirst({
      where: { title: item.title },
    });

    if (!existingItem) {
      await prisma.heroItem.create({
        data: item,
      });
      console.log(`Created hero item: ${item.title}`);
    } else {
      console.log(`Hero item already exists: ${item.title}`);
    }
  }

  console.log("Hero items seeded successfully!");
};

export default seedHeroItems;

// Run the seed function
seedHeroItems()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
