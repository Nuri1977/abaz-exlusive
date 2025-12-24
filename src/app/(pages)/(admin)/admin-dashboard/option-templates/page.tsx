import { AddOptionTemplateDialog } from "./_components/AddOptionTemplateDialog";
import { OptionTemplatesTable } from "./_components/OptionTemplatesTable";

export default function OptionTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Option Templates</h2>
          <p className="text-muted-foreground">
            Manage reusable option templates (e.g., standard size runs, colors) used
            when creating products.
          </p>
        </div>
        <AddOptionTemplateDialog />
      </div>

      <OptionTemplatesTable />
    </div>
  );
}
