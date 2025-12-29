import React from "react";

import type { FileUploadThing } from "@/types/UploadThing";
import getBestSellersSSG, {
  type BestSellerWithProduct,
} from "@/services/best-sellers/bestSellersService";

import ProductCardScroller from "../shared/ProductCardScroller";

const BestSellers = async () => {
  const bestSellers: BestSellerWithProduct[] = await getBestSellersSSG();

  // Transform the data to match the Product interface
  const products = bestSellers.map((item) => ({
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
    <section id="best-sellers">
      <ProductCardScroller
        products={products}
        title="Best Sellers"
        iconName="award"
      />
    </section>
  );
};

export default BestSellers;
