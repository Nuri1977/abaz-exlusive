import { AddProductForm } from "./_components/AddProductForm";

export default async function AddProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Product</h1>
        <p className="text-muted-foreground">
          Create a new product for your store.
        </p>
      </div>
      <AddProductForm />
    </div>
  );
}
