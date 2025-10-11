import { redirect } from "next/navigation";

import { getSessionServer } from "@/helpers/getSessionServer";

import NewArrivalsClient from "./_components/NewArrivalsClient";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

const NewArrivalsPage = async () => {
  const session = await getSessionServer();
  if (!session?.user?.isAdmin) redirect("/");

  const response = await fetch(`${NEXT_PUBLIC_API_URL}/admin/new-arrivals`, {
    next: { tags: ["new-arrivals", "*"] },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data. Status: ${response.statusText}`);
  }

  const newArrivals = (await response.json()) || [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">New Arrivals</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Manage your new arrival products and featured items.
        </p>
      </div>
      <NewArrivalsClient newArrivals={newArrivals} />
    </div>
  );
};

export default NewArrivalsPage;
