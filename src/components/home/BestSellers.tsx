import React from "react";

import getBestSellersSSG from "@/services/best-sellers/bestSellersService";
import type { FileUploadThing } from "@/types/UploadThing";

import ProductCardScroller from "../shared/ProductCardScroller";

const BestSellers = async () => {
  const bestSellers = await getBestSellersSSG();

  // Transform the data to match the Product interface
  const products = bestSellers.map((item) => ({
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
    <section id="best-sellers" className="py-14">
      <ProductCardScroller
        products={products}
        title="Best Sellers"
        iconName="award"
      />
    </section>
  );
};

export default BestSellers;
