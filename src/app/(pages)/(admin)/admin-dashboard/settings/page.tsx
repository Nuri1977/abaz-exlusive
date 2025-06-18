import { Suspense } from "react";
import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Settings | Admin Dashboard",
  description: "Manage your store settings",
};

function SettingsPageSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Settings</CardTitle>
        <CardDescription>Manage your store settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </CardContent>
    </Card>
  );
}

async function SettingsContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Settings</CardTitle>
        <CardDescription>Manage your store settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Store settings will be implemented here</p>
      </CardContent>
    </Card>
  );
}

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<SettingsPageSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
