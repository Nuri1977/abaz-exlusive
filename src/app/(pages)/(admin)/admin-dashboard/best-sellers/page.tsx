import { redirect } from "next/navigation";

import { getSessionServer } from "@/helpers/getSessionServer";

import BestSellersClient from "./_components/BestSellersClient";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

const BestSellersPage = async () => {
  const session = await getSessionServer();
  if (!session?.user?.isAdmin) redirect("/");

  const response = await fetch(`${NEXT_PUBLIC_API_URL}/admin/best-sellers`, {
    next: { tags: ["best-sellers", "*"] },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data. Status: ${response.statusText}`);
  }

  const bestSellers = (await response.json()) || [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">Best Sellers</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Manage your best selling products and top performers.
        </p>
      </div>
      <BestSellersClient bestSellers={bestSellers} />
    </div>
  );
};

export default BestSellersPage;
