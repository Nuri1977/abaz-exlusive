import { isAdminServer } from "@/helpers/isAdminServer";
import { CategoryTable } from "./_components/CategoryTable";

export default async function CategoriesPage() {
  const isAdmin = await isAdminServer();

  if (!isAdmin) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-destructive">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground">Manage your product categories.</p>
      </div>
      <CategoryTable />
    </div>
  );
}
