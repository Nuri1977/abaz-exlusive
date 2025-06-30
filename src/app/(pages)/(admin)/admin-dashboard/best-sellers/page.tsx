import { redirect } from "next/navigation";

import Breadcrumb from "@/components/admin/breadcrumb";
import { getSessionServer } from "@/helpers/getSessionServer";

import BestSellersClient from "./_components/BestSellersClient";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

const BestSellersPage = async () => {
  const session = await getSessionServer();
  if (!session?.user?.isAdmin) redirect("/");

  const breadcrumbItems = [
    { title: "Best Sellers", link: "/admin/best-sellers" },
  ];

  const response = await fetch(`${NEXT_PUBLIC_API_URL}/admin/best-sellers`, {
    next: { tags: ["best-sellers", "*"] },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data. Status: ${response.statusText}`);
  }

  const bestSellers = (await response.json()) || [];

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Breadcrumb items={breadcrumbItems} />

        <BestSellersClient bestSellers={bestSellers} />
      </div>
    </>
  );
};

export default BestSellersPage;
