import type {
  CartItem,
  Like,
  OrderItem,
  Product,
  ProductOption,
  ProductVariant,
} from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";

import type { FileUploadThing } from "./UploadThing";

export interface ProductExt extends Omit<Product, "images"> {
  images: FileUploadThing[] | null;
  options?: ProductOption[];
  variants?: ProductVariant[];
  cartItems?: CartItem[];
  orderItems?: OrderItem[];
  likes?: Like[];
}

export type ProductWithOptionsAndVariants = Omit<Product, "images"> & {
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
    price: Decimal | null;
    stock: number;
    options: {
      optionValue: {
        id: string;
        value: string;
      };
    }[];
  }[];
};
