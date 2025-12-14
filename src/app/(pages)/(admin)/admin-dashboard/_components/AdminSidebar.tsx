"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlignLeft, type LucideIcon } from "lucide-react";

import { adminLinks } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Navigation links component
const AdminNavLinks = ({ onClick }: { onClick?: () => void }) => {
  const pathname = usePathname();

  return (
    <div className="space-y-1 p-2">
      {adminLinks.map((link) => {
        const Icon = link.icon as LucideIcon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onClick}
            className={cn(
              "flex items-center rounded-lg p-3 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
              isActive
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="mr-3 size-4" />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

const AdminSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden min-h-screen w-64 border-r bg-background md:block">
        <div className="py-4">
          <div className="px-3 py-2">
            <h2 className="mb-4 px-4 text-xl font-semibold tracking-tight">
              Admin Panel
            </h2>
            <ScrollArea className="h-[calc(100vh-120px)]">
              <AdminNavLinks />
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Mobile Header with Sidebar Trigger */}
      <div className="sticky top-0 z-30 flex w-full items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <AlignLeft className="size-5" />
                <span className="sr-only">Toggle admin menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] pr-0">
              <div className="px-1 py-4">
                <h2 className="mb-4 px-4 text-lg font-semibold tracking-tight">
                  Admin Panel
                </h2>
                <ScrollArea className="h-[calc(100vh-120px)]">
                  <AdminNavLinks onClick={() => setOpen(false)} />
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
