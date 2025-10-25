import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

export async function CollectionsList() {
  const collections = await prisma.collection.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const getImageUrl = (image: any) => {
    if (!image) return "/placeholder.png";
    if (typeof image === "string") return image;
    return image?.url || image?.appUrl || "/placeholder.png";
  };

  if (collections.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted-foreground">
          No collections available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={`/collections/${collection.slug}`}
          className="group relative block"
        >
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={getImageUrl(collection.image)}
              alt={collection.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-center text-white font-light tracking-widest text-sm md:text-base lg:text-lg uppercase">
                {collection.name}
              </h2>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}