import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";

import getCollectionsSSG from "@/services/collections/collectionService";

type CollectionWithCount = Prisma.CollectionGetPayload<{
  include: {
    _count: {
      select: {
        products: true;
      };
    };
  };
}>;

export async function CollectionsList() {
  const collections = await getCollectionsSSG();

  const getImageUrl = (image: unknown) => {
    if (!image) return "/placeholder.png";
    if (typeof image === "string") return image;
    if (typeof image === "object" && image !== null) {
      const imageObj = image as { url?: string; appUrl?: string };
      return imageObj?.url || imageObj?.appUrl || "/placeholder.png";
    }
    return "/placeholder.png";
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
      {collections.map((collection: CollectionWithCount) => (
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
              <h2 className="text-center text-sm font-light uppercase tracking-widest text-white md:text-base lg:text-lg">
                {collection.name}
              </h2>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}