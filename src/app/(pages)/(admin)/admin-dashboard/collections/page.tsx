import { CollectionTable } from "./_components/CollectionTable";

export default async function CollectionsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">Collections</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Manage your product collections and themes.
        </p>
      </div>
      <CollectionTable />
    </div>
  );
}