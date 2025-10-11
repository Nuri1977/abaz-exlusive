import { ProductTable } from "./_components/ProductTable";

export default async function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">Products</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Manage your products and inventory.
        </p>
      </div>
      <ProductTable />
    </div>
  );
}
