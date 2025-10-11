"use client";

import { usePathname } from "next/navigation";

import { Header } from "./Header";

export function ConditionalHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Don't render the regular header on the home page
  // The home page will use the HeroHeader instead
  if (isHomePage) {
    return null;
  }

  return <Header />;
}
