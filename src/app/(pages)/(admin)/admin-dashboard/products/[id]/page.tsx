import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import type { ProductWithOptionsAndVariants } from "@/types/product";
import type { FileUploadThing } from "@/types/UploadThing";
import { prisma } from "@/lib/prisma";

import { EditProductForm } from "./_components/EditProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    category: true;
    collection: true;
    options: {
      include: {
        values: true;
      };
    };
    variants: {
      include: {
        options: {
          include: {
            optionValue: {
              include: {
                option: true;
              };
            };
          };
        };
      };
    };
  };
}>;

// Explicitly type the variant to include base fields and relations
type VariantWithDetails = ProductWithDetails["variants"][number];

// Function to serialize product data and convert Decimal to number
const serializeProduct = (
  product: ProductWithDetails
): ProductWithOptionsAndVariants => {
  return {
    ...product,
    price: product.price ? parseFloat(product.price.toString()) : null,
    compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice.toString()) : null,
    images: (product.images as unknown as FileUploadThing[]) || [],
    variants:
      product.variants?.map((variant: VariantWithDetails) => {
        // Use unknown cast to access images if TS is being stubborn about model fields
        const variantImages = (variant as unknown as { images: Prisma.JsonValue[] })
          .images;

        return {
          ...variant,
          price: variant.price ? parseFloat(variant.price.toString()) : null,
          compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice.toString()) : null,
          images: (variantImages as unknown as FileUploadThing[]) || [],
          options: variant.options.map((opt) => ({
            optionValue: {
              ...opt.optionValue,
              option: opt.optionValue.option,
            },
          })),
        };
      }) || [],
  } as ProductWithOptionsAndVariants;
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
              optionValue: {
                include: {
                  option: true,
                },
              },
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
  const serializedProduct = serializeProduct(product);

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
