import type { CartItem, Like, OrderItem, Product, ProductOption, ProductVariant } from "@prisma/client";
import { FileUploadThing } from "./UploadThing";

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

export default ProductWithOptions;
