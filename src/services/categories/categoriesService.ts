import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// model Category {
//     id          String     @id @default(uuid())
//     name        String
//     slug        String     @unique
//     description String?
//     image       Json?      @default("null")
//     parentId    String?
//     parent      Category?  @relation("CategoryToCategory", fields: [parentId], references: [id], onDelete: SetNull)
//     children    Category[] @relation("CategoryToCategory")
//     products    Product[]
//     level       Int        @default(0) // Track hierarchy level
//     isActive    Boolean    @default(true)
//     createdAt   DateTime   @default(now())
//     updatedAt   DateTime   @updatedAt
  
//     @@index([parentId])
//     @@map("category")
//   }

export const getCategoriesSA = unstable_cache(
  async () => {
let categories = null;
    try {
      categories = await prisma.category.findMany({
        include: {
            parent: {
                include: {
                    parent: true,
                },
            },
            children: {
                include: {
                    children: true,
                },
            },
        },
        orderBy: [
          { level: "asc" },
          { name: "asc" },
        ],
        });   
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
    return categories;
  },
  ["categories"],
  {
    tags: ["categories"],
  }
);