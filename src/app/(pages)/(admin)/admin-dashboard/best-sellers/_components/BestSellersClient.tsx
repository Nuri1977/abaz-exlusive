"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { BestSellers, Product } from "@prisma/client";
import { Edit, Plus, Trash2 } from "lucide-react";

import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Heading } from "@/components/admin/ui/heading";
import ModalWrapper from "@/components/shared/modals/ModalWrapper";

import AddBestSeller from "./blocks/AddBestSeller";

interface BestSellerWithProduct extends BestSellers {
  product: Product & {
    category: {
      id: string;
      name: string;
    };
  };
}

interface Props {
  bestSellers: BestSellerWithProduct[];
}

const BestSellersClient = ({ bestSellers }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isAddNewMode, setIsAddNewMode] = React.useState(false);
  const [isDeleteMode, setIsDeleteMode] = React.useState(false);
  const [deleteBestSellerId, setDeleteBestSellerId] = React.useState<
    string | undefined
  >(undefined);
  const [loading, setLoading] = React.useState(false);
  const [editBestSeller, setEditBestSeller] =
    React.useState<BestSellerWithProduct | null>(null);

  const handleDeleteBestSeller = async () => {
    if (!deleteBestSellerId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/best-sellers`, {
        method: "DELETE",
        body: JSON.stringify({ id: deleteBestSellerId }),
      });
      if (!response.ok) {
        toast({
          title: "Error",
          description: `Failed to delete best seller. Status: ${JSON.stringify(
            response
          )}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Best seller removed successfully",
        });
        router.refresh();
        setIsDeleteMode(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: JSON.stringify(error, null, 2),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mt-4 flex items-start justify-between">
        <Heading
          title={`Best Sellers (${bestSellers.length})`}
          description="Manage best seller products"
        />
      </div>
      <div>
        <Button className="mt-4" onClick={() => setIsAddNewMode(!isAddNewMode)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Best Seller
        </Button>
        {isAddNewMode && (
          <ModalWrapper
            openModal={isAddNewMode}
            setOpenModal={setIsAddNewMode}
            titleText={editBestSeller ? "Edit Best Seller" : "Add Best Seller"}
            buttonTest="Cancel"
            onButtonClick={() => {
              setIsAddNewMode(false);
              setEditBestSeller(null);
            }}
          >
            <AddBestSeller
              isOpen={isAddNewMode}
              setIsOpen={setIsAddNewMode}
              editBestSeller={editBestSeller}
            />
          </ModalWrapper>
        )}
      </div>

      <Table className="mt-8">
        <TableCaption>A list of best seller products.</TableCaption>
        <TableHeader className="bg-accent">
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Added Date</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bestSellers.map((bestSeller) => (
            <TableRow key={bestSeller.id}>
              <TableCell className="underline-2 cursor-pointer py-1 hover:underline">
                {bestSeller.product?.name}
              </TableCell>
              <TableCell className="py-1">
                {bestSeller.product?.category?.name}
              </TableCell>
              <TableCell className="py-1">
                ${bestSeller.product?.price?.toString()}
              </TableCell>
              <TableCell className="py-1">
                {new Date(bestSeller.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex items-center justify-center gap-2 py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditBestSeller(bestSeller);
                    setIsAddNewMode(!isAddNewMode);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsDeleteMode(true);
                    setDeleteBestSellerId(bestSeller.id);
                  }}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ModalWrapper
        openModal={isDeleteMode}
        setOpenModal={setIsDeleteMode}
        titleText="Remove Best Seller"
        buttonTest="Cancel"
        onButtonClick={() => setIsDeleteMode(false)}
      >
        <div className="p-8 text-center">
          <p>Are you sure you want to remove this product from best sellers?</p>
          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="destructive"
              onClick={() => handleDeleteBestSeller()}
              disabled={loading}
            >
              {loading ? "Loading.." : "Remove"}
            </Button>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
};

export default BestSellersClient;
