import { CategoryTable } from "./_components/CategoryTable";

export default async function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">Categories</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Manage your product categories.
        </p>
      </div>
      <CategoryTable />
    </div>
  );
}
