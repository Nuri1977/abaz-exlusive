import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return "N/A";

  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function slugify(text: string): string {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      // eslint-disable-next-line no-useless-escape
      .replace(/\-\-+/g, "-")
  );
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("mk-MK", {
    style: "currency",
    currency: "MKD",
  }).format(price);
};
