import type { CartItem, Like, OrderItem, Product, ProductOption, ProductVariant } from "@prisma/client";
import { FileUploadThing } from "./UploadThing";
import { Decimal } from "@prisma/client/runtime/library";

interface ProductWithOptions extends Omit<Product, "images"> {
  images: FileUploadThing[] | null;
  options: {
    name: string;
    values: {
      value: string;
    }[];
  }[];
}

export interface ProductExt extends Omit<Product, "images"> {
  images: FileUploadThing[] | null;
  options?:     ProductOption[]
  variants?:    ProductVariant[]
  cartItems?:   CartItem[]
  orderItems?:  OrderItem[]
  likes?:       Like[]
}

export type ProductWithVariants = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  brand: string;
  material: string | null;
  gender: string;
  style: string;
  price: Decimal | null;
  features: string[];
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  variants: {
    id: string;
    sku: string;
    price: Decimal | null;
    stock: number;
    options: {
      optionValue: {
        id: string;
        value: string;
      };
    }[];
  }[];
  category: {
    id: string;
    name: string;
  } | null;
  images: FileUploadThing[] | null;
};

export default ProductWithOptions;
