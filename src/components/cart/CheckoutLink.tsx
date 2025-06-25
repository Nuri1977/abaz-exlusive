"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import { Button } from "../ui/button";

interface CheckoutLinkProps {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
}

const CheckoutLink = ({ isOpen, setOpen }: CheckoutLinkProps) => {
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        if (isOpen) setOpen(!isOpen);
        router.push("/checkout");
      }}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      Proceed to checkout
    </Button>
  );
};

export default CheckoutLink;
