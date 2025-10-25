import Link from "next/link";

import { adminLinks } from "@/constants/routes";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboardPage = async () => {
  const usersCount = await prisma.user.count();

  const links = adminLinks.map((item) => {
    if (item.href === "/admin-dashboard/users") {
      return { ...item, value: String(usersCount) };
    }
    return item;
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Welcome to the Shop admin panel.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {links.map((item, index) => (
          <Link href={item.href} key={index}>
            <Card className="cursor-pointer transition-all duration-200 hover:bg-muted/50 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.name}
                </CardTitle>
                <item.icon className="size-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold md:text-2xl">
                  {item.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
