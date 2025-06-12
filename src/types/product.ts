import { Product } from "@prisma/client";

interface ProductWithOptions extends Product {
  options: {
    name: string;
    values: {
      value: string;
    }[];
  }[];
}

export default ProductWithOptions;
