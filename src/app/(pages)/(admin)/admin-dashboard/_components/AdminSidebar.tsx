"use client";

import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlignLeft, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { adminLinks } from "@/utils/constants";

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
              "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
              isActive ? "bg-accent text-accent-foreground" : "transparent"
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
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
      <div className="min-h-screen border-r bg-background w-64 hidden md:block">
        <div className="py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight">
              Admin Panel
            </h2>
            <ScrollArea className="h-[calc(100vh-100px)]">
              <AdminNavLinks />
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Trigger */}
      <div className="md:hidden flex items-center justify-between py-3 px-4 w-full sticky top-0 bg-background z-30">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <AlignLeft className="h-5 w-5" />
              <span className="sr-only">Toggle admin menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] sm:w-[300px] pr-0">
            <div className="px-1 py-4">
              <ScrollArea className="h-[calc(100vh-100px)]">
                <AdminNavLinks onClick={() => setOpen(false)} />
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default AdminSidebar;
