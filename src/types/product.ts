import type {
  CartItem,
  Like,
  OrderItem,
  Product,
  ProductOption,
  ProductVariant,
} from "@prisma/client";

import type { FileUploadThing } from "./UploadThing";

export interface ProductExt extends Omit<Product, "images"> {
  images: FileUploadThing[] | null;
  options?: ProductOption[];
  variants?: ProductVariant[];
  cartItems?: CartItem[];
  orderItems?: OrderItem[];
  likes?: Like[];
}

export type ProductWithOptionsAndVariants = Omit<
  Product,
  "images" | "price"
> & {
  price: string | number | null;
  images: FileUploadThing[] | null;
  category: {
    id: string;
    name: string;
  } | null;
  options: {
    name: string;
    values: {
      value: string;
    }[];
  }[];
  variants: {
    id: string;
    sku: string;
    price: string | number | null;
    stock: number;
    options: {
      optionValue: {
        id: string;
        value: string;
      };
    }[];
  }[];
};

export type ProductWithVariants = Product & {
  variants: Array<{
    id: string;
    sku: string;
    price: number | null;
    stock: number;
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
