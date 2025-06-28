"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BestSellers, Product } from "@prisma/client";

import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BestSellerWithProduct extends BestSellers {
  product: Product & {
    category: {
      id: string;
      name: string;
    };
  };
}

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editBestSeller: BestSellerWithProduct | null;
}

const AddBestSeller = ({ isOpen, setIsOpen, editBestSeller }: Props) => {
  const { toast } = useToast();
  const router = useRouter();
  const [productId, setProductId] = useState<string>(
    editBestSeller?.productId || ""
  );
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const addBestSeller = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productId) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/best-sellers`, {
        method: "POST",
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to add best seller",
          variant: "destructive",
        });
      } else {
        router.refresh();
        toast({
          title: "Success",
          description: "Product added to best sellers successfully",
        });
        setIsOpen(false);
        setProductId("");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBestSeller = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productId || !editBestSeller?.id) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/best-sellers`, {
        method: "PUT",
        body: JSON.stringify({ id: editBestSeller.id, productId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update best seller",
          variant: "destructive",
        });
      } else {
        router.refresh();
        toast({
          title: "Success",
          description: "Best seller updated successfully",
        });
        setIsOpen(false);
        setProductId("");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (editBestSeller) {
      updateBestSeller(e);
    } else {
      addBestSeller(e);
    }
  };

  return (
    <form className="p-4" onSubmit={handleSubmit}>
      <Label>Select Product</Label>
      <Select value={productId} onValueChange={setProductId}>
        <SelectTrigger className="mt-2">
          <SelectValue placeholder="Choose a product" />
        </SelectTrigger>
        <SelectContent>
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id}>
              {product.name} - ${product.price.toString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="my-4">
        <Button
          type="submit"
          className="mt-4 rounded-md bg-primary px-4 py-2 text-white"
          disabled={loading || !productId}
        >
          {loading
            ? `${editBestSeller ? "Updating..." : "Adding..."}`
            : `${editBestSeller ? "Update" : "Add"}`}
        </Button>
      </div>
    </form>
  );
};

export default AddBestSeller;
