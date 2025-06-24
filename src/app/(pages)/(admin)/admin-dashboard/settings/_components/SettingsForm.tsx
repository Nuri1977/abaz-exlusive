"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { settingsFormSchema, type SettingsFormData } from "@/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings } from "@prisma/client";
import { AlertCircle } from "lucide-react";
import { SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";

import { useToast } from "@/hooks/useToast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heading } from "@/components/admin/ui/heading";

interface Props {
  settings: Settings | null;
}

const SettingsForm = ({ settings }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      id: settings?.id || "default",
      name: settings?.name || "",
      address: settings?.address || "",
      city: settings?.city || "",
      state: settings?.state || "",
      telephone: settings?.telephone || "",
      email: settings?.email || "",
      facebook: settings?.facebook || null,
      twitter: settings?.twitter || null,
      instagram: settings?.instagram || null,
      youtube: settings?.youtube || null,
      aboutInfo: settings?.aboutInfo || "",
    },
  });

  const onError: SubmitErrorHandler<SettingsFormData> = (errors) => {
    setFormError("Please check the form for errors and try again.");
  };

  const onSubmit: SubmitHandler<SettingsFormData> = async (formData) => {
    setFormError(null);
    try {
      const method = settings ? "PUT" : "POST";
      const response = await fetch("/api/admin/settings", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response?.ok) {
        toast({
          title: "Error",
          description: result?.message || "Failed to save settings",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });

      router.refresh();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="mt-4 flex items-start justify-between">
        <Heading
          title="Company Settings"
          description="Manage company information"
        />
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="flex max-w-md flex-col gap-4 py-8"
        >
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Company Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="State" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telephone</FormLabel>
                <FormControl>
                  <Input placeholder="Telephone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="Facebook URL"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="Twitter URL"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="Instagram URL"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="youtube"
            render={({ field }) => (
              <FormItem>
                <FormLabel>YouTube URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="YouTube URL"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aboutInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About Information</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="About Information"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="mt-4 w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SettingsForm;
