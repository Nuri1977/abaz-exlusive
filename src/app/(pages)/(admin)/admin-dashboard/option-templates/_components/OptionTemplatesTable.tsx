"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/useToast";
import { EditOptionTemplateDialog } from "./EditOptionTemplateDialog";

interface OptionTemplate {
  id: string;
  name: string;
  values: { id: string; value: string }[];
  createdAt: string;
}

export function OptionTemplatesTable() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery<OptionTemplate[]>({
    queryKey: ["option-templates"],
    queryFn: async () => {
      const response = await fetch("/api/admin/option-templates");
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json() as Promise<OptionTemplate[]>;
    },
  });

  const { mutate: deleteTemplate } = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/option-templates/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete template");
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      await queryClient.invalidateQueries({ queryKey: ["option-templates"] });
      router.refresh();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Values</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates?.map((template) => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {template.values.map((v) => (
                    <span
                      key={v.id}
                      className="rounded bg-secondary px-2 py-0.5 text-xs"
                    >
                      {v.value}
                    </span>
                  ))}
                  {template.values.length === 0 && (
                    <span className="italic text-muted-foreground">No values</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(template.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <EditOptionTemplateDialog
                      template={template}
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </DropdownMenuItem>
                      }
                    />
                    <DropdownMenuItem
                      onClick={() => deleteTemplate(template.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {templates?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No templates found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
