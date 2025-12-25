import type { CartItem, Like, OrderItem, Product } from "@prisma/client";

import type { FileUploadThing } from "./UploadThing";

export interface ProductExt extends Omit<
  Product,
  "images" | "price" | "compareAtPrice" | "options" | "variants"
> {
  images: FileUploadThing[] | null;
  price: number | string | null;
  compareAtPrice?: number | string | null;
  options?: unknown[];
  variants?: unknown[];
  cartItems?: CartItem[];
  orderItems?: OrderItem[];
  likes?: Like[];
}

export type ProductWithOptionsAndVariants = Omit<
  Product,
  "images" | "price" | "compareAtPrice"
> & {
  price: string | number | null;
  compareAtPrice?: string | number | null;
  images: FileUploadThing[] | null;
  category: {
    id: string;
    name: string;
  } | null;
  options: {
    id: string;
    name: string;
    values: {
      id: string;
      value: string;
    }[];
  }[];
  variants: {
    id: string;
    sku: string;
    price: string | number | null;
    compareAtPrice?: string | number | null;
    stock: number;
    images?: FileUploadThing[] | null;
    options: {
      optionValue: {
        id: string;
        value: string;
        optionId: string;
        option?: {
          name: string;
        };
      };
    }[];
  }[];
};

export type ProductWithVariants = Product & {
  variants: Array<{
    id: string;
    sku: string;
    price: number | null;
    compareAtPrice?: number | null;
    stock: number;
    images?: FileUploadThing[] | null;
    options: Array<{
      optionValue: {
        id: string;
        value: string;
      };
    }>;
  }>;
  category: {
    id: string;
    name: string;
    level: number;
    parentId: string | null;
    parent?: {
      id: string;
      name: string;
      parentId: string | null;
      parent?: {
        id: string;
        name: string;
        parentId: string | null;
      } | null;
    } | null;
  } | null;
  collection?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images: FileUploadThing[] | null;
};

export type CategoryWithParent = {
  id: string;
  name: string;
  level: number;
  parentId: string | null;
  parent?: CategoryWithParent | null;
  children?: CategoryWithParent[];
};
