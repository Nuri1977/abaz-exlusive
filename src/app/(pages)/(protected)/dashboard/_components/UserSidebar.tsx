"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlignLeft } from "lucide-react";

import { userLinks } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Navigation links component
const UserNavLinks = ({ onClick }: { onClick?: () => void }) => {
  const pathname = usePathname();

  return (
    <div className="space-y-1 p-2">
      {userLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onClick}
            // eslint-disable-next-line tailwindcss/no-custom-classname
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "transparent"
            )}
          >
            <Icon className="mr-2 size-4" />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

const UserSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden min-h-screen w-64 border-r bg-background md:block">
        <div className="py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight">
              User Dashboard
            </h2>
            <ScrollArea className="h-[calc(100vh-100px)]">
              <UserNavLinks />
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Trigger */}
      <div className="sticky top-0 z-30 flex w-full items-center justify-between bg-background px-4 py-3 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <AlignLeft className="size-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] pr-0 sm:w-[300px]">
            <div className="px-1 py-4">
              {/* Title for mobile sheet */}
              <div className="px-3 py-2">
                <h2 className="mb-2 px-1 text-lg font-semibold tracking-tight">
                  User Dashboard
                </h2>
              </div>
              <ScrollArea className="h-[calc(100vh-140px)]">
                <UserNavLinks onClick={() => setOpen(false)} />
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default UserSidebar;
