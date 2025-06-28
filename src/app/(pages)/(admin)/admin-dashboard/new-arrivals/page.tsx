import { redirect } from "next/navigation";

import Breadcrumb from "@/components/admin/breadcrumb";
import { getSessionServer } from "@/helpers/getSessionServer";

import NewArrivalsClient from "./_components/NewArrivalsClient";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

const NewArrivalsPage = async () => {
  const session = await getSessionServer();
  if (!session?.user?.isAdmin) redirect("/");

  const breadcrumbItems = [
    { title: "New Arrivals", link: "/admin/new-arrivals" },
  ];

  const response = await fetch(`${NEXT_PUBLIC_API_URL}/admin/new-arrivals`, {
    next: { tags: ["new-arrivals", "*"] },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data. Status: ${response.statusText}`);
  }

  const newArrivals = (await response.json()) || [];

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Breadcrumb items={breadcrumbItems} />

        <NewArrivalsClient newArrivals={newArrivals} />
      </div>
    </>
  );
};

export default NewArrivalsPage;
