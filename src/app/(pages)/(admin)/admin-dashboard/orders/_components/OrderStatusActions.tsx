import Link from "next/link";
import { type UseMutationResult } from "@tanstack/react-query";
import { Eye, MoreHorizontal, Trash2 } from "lucide-react";

import { type Order } from "@/types/Order";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OrderStatusActionsProps {
  order: Order;
  mutation: UseMutationResult<
    Order,
    Error,
    { orderId: string; status: string },
    unknown
  >;
  onDelete: () => void;
  mobile?: boolean;
}

export function OrderStatusActions({
  order,
  mutation,
  onDelete,
}: OrderStatusActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="size-8 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link
            href={`/admin-dashboard/orders/${order.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="mr-2 size-4" />
            Preview
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {order?.status === "PENDING" && (
          <>
            <DropdownMenuItem
              disabled={mutation.isPending}
              onClick={(e) => {
                e.stopPropagation();
                mutation.mutate({ orderId: order?.id, status: "PROCESSING" });
              }}
            >
              Accept Order
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={mutation.isPending}
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                mutation.mutate({ orderId: order?.id, status: "CANCELLED" });
              }}
            >
              Decline Order
            </DropdownMenuItem>
          </>
        )}

        {order?.status === "PROCESSING" && (
          <DropdownMenuItem
            disabled={mutation.isPending}
            onClick={(e) => {
              e.stopPropagation();
              mutation.mutate({ orderId: order?.id, status: "SHIPPED" });
            }}
          >
            Mark Shipped
          </DropdownMenuItem>
        )}

        {order?.status === "SHIPPED" && (
          <DropdownMenuItem
            disabled={mutation.isPending}
            onClick={(e) => {
              e.stopPropagation();
              mutation.mutate({ orderId: order?.id, status: "DELIVERED" });
            }}
          >
            Mark Delivered
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="mr-2 size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
