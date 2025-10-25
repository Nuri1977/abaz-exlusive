import { notFound } from "next/navigation";

import { ProductExt } from "@/types/product";
import { prisma } from "@/lib/prisma";

import { EditProductForm } from "./_components/EditProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

// Function to serialize product data and convert Decimal to number
const serializeProduct = (product: any) => {
  return {
    ...product,
    price: product.price ? parseFloat(product.price.toString()) : null,
    variants:
      product.variants?.map((variant: any) => ({
        ...variant,
        price: variant.price ? parseFloat(variant.price.toString()) : null,
      })) || [],
  };
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  // Fetch the product with all related data
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      collection: true,
      options: {
        include: {
          values: true,
        },
      },
      variants: {
        include: {
          options: {
            include: {
              optionValue: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Serialize the product data to handle Decimal values
  const serializedProduct = serializeProduct(product) as ProductExt | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">
          Update the product information for {product.name}.
        </p>
      </div>
      <EditProductForm product={serializedProduct} />
    </div>
  );
}
