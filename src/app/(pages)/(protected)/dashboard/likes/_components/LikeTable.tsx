"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserAccountContext } from "@/context/UserAccountContext";

import type { ProductWithOptionsAndVariants } from "@/types/product";
import type { FileUploadThing } from "@/types/UploadThing";
import { Button } from "@/components/ui/button";
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

  if (areLikedProductsLoading) return <LikeSkeleton />;

  if (!likedProducts || likedProducts.length === 0) {
    return <p>No likes yet. Start liking products to see them here!</p>;
  }

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead className="w-[150px]">Product</TableHead>
            <TableHead>Image</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(likedProducts as LikedProduct[]).map((product, index) => {
            if (!product) return null;

            return (
              <TableRow key={product.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <p className="text-md font-bold">{product?.name}</p>
                </TableCell>
                <TableCell>
                  <Image
                    src={product?.images?.[0]?.url || "/placeholder.png"}
                    alt={`${product?.name || "Product"} Image`}
                    width={100}
                    height={100}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    className="mr-4 w-16"
                    variant="outline"
                    onClick={() => router.push(`/product/${product?.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    className="w-16"
                    variant="destructive"
                    onClick={() => unlike(product)}
                  >
                    Unlike
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
