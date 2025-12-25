import React from "react";

import getNewArrivalsSSG from "@/services/new-arrivals/newArrivalsService";
import type { FileUploadThing } from "@/types/UploadThing";

import ProductCardScroller from "../shared/ProductCardScroller";

const NewArrivals = async () => {
  const newArrivals = await getNewArrivalsSSG();

  // Transform the data to match the Product interface
  const products = newArrivals.map((item) => ({
    ...item.product,
    id: item.product?.id || "",
    name: item.product?.name || "",
    slug: item.product?.slug || "",
    price: parseFloat(item.product?.price?.toString() || "0"),
    compareAtPrice: item.product?.compareAtPrice ? parseFloat(item.product.compareAtPrice.toString()) : null,
    images: (item.product?.images as unknown as FileUploadThing[]) || [],
    category: item.product?.category,
    brand: item.product?.brand || "",
    description: item.product?.description || "",
  }));

  return (
    <section id="new-arrivals" className="py-24">
      <ProductCardScroller
        products={products}
        title="New Arrivals"
        iconName="sparkles"
      />
    </section>
  );
};

export default NewArrivals;
