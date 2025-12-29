import React from "react";

import type { FileUploadThing } from "@/types/UploadThing";
import getNewArrivalsSSG, {
  type NewArrivalWithProduct,
} from "@/services/new-arrivals/newArrivalsService";

import ProductCardScroller from "../shared/ProductCardScroller";

const NewArrivals = async () => {
  const newArrivals: NewArrivalWithProduct[] = await getNewArrivalsSSG();

  // Transform the data to match the Product interface
  const products = newArrivals.map((item) => ({
    ...item.product,
    id: item.product?.id || "",
    name: item.product?.name || "",
    slug: item.product?.slug || "",
    price: parseFloat(String(item.product?.price ?? "0")),
    compareAtPrice: item.product?.compareAtPrice
      ? parseFloat(String(item.product.compareAtPrice))
      : null,
    images: (item.product?.images as unknown as FileUploadThing[]) || [],
    category: item.product?.category,
    brand: item.product?.brand || "",
    description: item.product?.description || "",
    createdAt: item.product?.createdAt || new Date(),
    updatedAt: item.product?.updatedAt || new Date(),
    style: item.product?.style || "",
    gender: item.product?.gender || "",
    material: item.product?.material || null,
    categoryId: item.product?.categoryId || "",
    collectionId: item.product?.collectionId || null,
    features: item.product?.features || [],
  }));

  return (
    <section id="new-arrivals">
      <ProductCardScroller
        products={products}
        title="New Arrivals"
        iconName="sparkles"
      />
    </section>
  );
};

export default NewArrivals;
