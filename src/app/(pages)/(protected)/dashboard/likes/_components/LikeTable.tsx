"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartContext } from "@/context/CartContext";
import { useUserAccountContext } from "@/context/UserAccountContext";
import { Eye, Trash2 } from "lucide-react";

import type { ProductWithOptionsAndVariants } from "@/types/product";
import type { FileUploadThing } from "@/types/UploadThing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import LikeSkeleton from "./LikeSkeleton";

interface LikedProduct extends Omit<ProductWithOptionsAndVariants, "images"> {
  images: FileUploadThing[];
}

export default function LikeTable() {
  const router = useRouter();
  const { likedProducts, unlike, areLikedProductsLoading } =
    useUserAccountContext();
  const { currency, convertPrice, currencySymbol } = useCartContext();

  if (areLikedProductsLoading) return <LikeSkeleton />;

  if (!likedProducts || likedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-lg text-muted-foreground">
          No likes yet. Start liking products to see them here!
        </p>
        <Button
          variant="link"
          onClick={() => router.push("/products")}
          className="mt-4"
        >
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead className="w-[150px]">Product</TableHead>
              <TableHead className="w-[200px]">Image</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(likedProducts as LikedProduct[]).map((product, index) => {
              if (!product) return null;

              const price = convertPrice?.(
                Number(product?.price ?? 0),
                "MKD",
                currency
              );

              return (
                <TableRow key={product.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <p className="text-base font-bold">{product?.name}</p>
                  </TableCell>
                  <TableCell>
                    <div className="relative size-24 overflow-hidden rounded-md border">
                      <Image
                        src={product?.images?.[0]?.url || "/placeholder.png"}
                        alt={`${product?.name || "Product"} Image`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {currencySymbol} {price?.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/product/${product?.slug}`)}
                      >
                        <Eye className="mr-2 size-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => unlike(product)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Unlike
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {(likedProducts as LikedProduct[]).map((product) => {
          if (!product) return null;

          const price = convertPrice?.(
            Number(product?.price ?? 0),
            "MKD",
            currency
          );

          return (
            <Card key={product.id} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                {/* Image Section */}
                <div className="relative size-24 shrink-0 overflow-hidden rounded-md border bg-muted">
                  <Image
                    src={product?.images?.[0]?.url || "/placeholder.png"}
                    alt={product?.name || "Product Image"}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="line-clamp-2 font-semibold">
                      {product?.name}
                    </h3>
                    <p className="text-lg font-bold text-primary">
                      {currencySymbol} {price?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <CardFooter className="flex gap-2 bg-muted/50 p-3">
                <Button
                  className="flex-1"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/product/${product?.slug}`)}
                >
                  <Eye className="mr-2 size-4" />
                  View
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  size="sm"
                  onClick={() => unlike(product)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Remove
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
