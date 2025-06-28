import { CategoryTable } from "./_components/CategoryTable";

export default async function CategoriesPage() {
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
