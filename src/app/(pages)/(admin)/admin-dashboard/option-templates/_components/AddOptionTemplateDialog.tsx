"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  values: z.array(z.string()).min(1, "At least one value is required"),
});

export function AddOptionTemplateDialog() {
  const [open, setOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      values: [],
    },
  });

  const { mutate: createTemplate, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await fetch("/api/admin/option-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json() as Promise<{ id: string; name: string }>;
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Option template created successfully",
      });
      setOpen(false);
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["option-templates"] });
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddValue = () => {
    if (!newValue.trim()) return;
    
    const currentValues = form.getValues("values");
    if (currentValues.includes(newValue.trim())) {
      toast({
        title: "Error",
        description: "Value already exists",
        variant: "destructive",
      });
      return;
    }

    form.setValue("values", [...currentValues, newValue.trim()]);
    setNewValue("");
  };

  const handleRemoveValue = (index: number) => {
    const currentValues = form.getValues("values");
    form.setValue(
      "values",
      currentValues.filter((_, i) => i !== index)
    );
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createTemplate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          Add Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Option Template</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Men's Shoe Sizes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Values</FormLabel>
              <div className="flex gap-2">
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g., 42"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddValue();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddValue}>
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {form.watch("values").map((value, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                  >
                    {value}
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(index)}
                      className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
              {form.formState.errors.values && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.values.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating..." : "Create Template"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
