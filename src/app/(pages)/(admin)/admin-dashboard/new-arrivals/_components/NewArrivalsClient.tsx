"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NewArrivals, Product } from "@prisma/client";
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

import AddNewArrival from "./blocks/AddNewArrival";

interface NewArrivalWithProduct extends NewArrivals {
  product: Product & {
    category: {
      id: string;
      name: string;
    };
  };
}

interface Props {
  newArrivals: NewArrivalWithProduct[];
}

const NewArrivalsClient = ({ newArrivals }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isAddNewMode, setIsAddNewMode] = React.useState(false);
  const [isDeleteMode, setIsDeleteMode] = React.useState(false);
  const [deleteNewArrivalId, setDeleteNewArrivalId] = React.useState<
    string | undefined
  >(undefined);
  const [loading, setLoading] = React.useState(false);
  const [editNewArrival, setEditNewArrival] =
    React.useState<NewArrivalWithProduct | null>(null);

  const handleDeleteNewArrival = async () => {
    if (!deleteNewArrivalId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/new-arrivals`, {
        method: "DELETE",
        body: JSON.stringify({ id: deleteNewArrivalId }),
      });
      if (!response.ok) {
        toast({
          title: "Error",
          description: `Failed to delete new arrival. Status: ${JSON.stringify(
            response
          )}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "New arrival removed successfully",
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
          title={`New Arrivals (${newArrivals.length})`}
          description="Manage new arrival products"
        />
      </div>
      <div>
        <Button className="mt-4" onClick={() => setIsAddNewMode(!isAddNewMode)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Arrival
        </Button>
        {isAddNewMode && (
          <ModalWrapper
            openModal={isAddNewMode}
            setOpenModal={setIsAddNewMode}
            titleText={editNewArrival ? "Edit New Arrival" : "Add New Arrival"}
            buttonTest="Cancel"
            onButtonClick={() => {
              setIsAddNewMode(false);
              setEditNewArrival(null);
            }}
          >
            <AddNewArrival
              isOpen={isAddNewMode}
              setIsOpen={setIsAddNewMode}
              editNewArrival={editNewArrival}
            />
          </ModalWrapper>
        )}
      </div>

      <Table className="mt-8">
        <TableCaption>A list of new arrival products.</TableCaption>
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
          {newArrivals.map((newArrival) => (
            <TableRow key={newArrival.id}>
              <TableCell className="underline-2 cursor-pointer py-1 hover:underline">
                {newArrival.product?.name}
              </TableCell>
              <TableCell className="py-1">
                {newArrival.product?.category?.name}
              </TableCell>
              <TableCell className="py-1">
                ${newArrival.product?.price?.toString()}
              </TableCell>
              <TableCell className="py-1">
                {new Date(newArrival.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex items-center justify-center gap-2 py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditNewArrival(newArrival);
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
                    setDeleteNewArrivalId(newArrival.id);
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
        titleText="Remove New Arrival"
        buttonTest="Cancel"
        onButtonClick={() => setIsDeleteMode(false)}
      >
        <div className="p-8 text-center">
          <p>Are you sure you want to remove this product from new arrivals?</p>
          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="destructive"
              onClick={() => handleDeleteNewArrival()}
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

export default NewArrivalsClient;
