"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartContext } from "@/context/CartContext";
import { LayoutDashboard, LogOut, Menu, Search, Settings } from "lucide-react";

import { navLinks } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Logo from "@/components/shared/Logo";
import { useIsAdmin } from "@/helpers/isAdminClient";

interface MobileSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  session: any;
  isPending: boolean;
  handleSignOut: () => Promise<void>;
  isHeroSection?: boolean;
  scrolled?: boolean;
}

export function MobileSidebar({
  open,
  setOpen,
  session,
  isPending,
  handleSignOut,
  isHeroSection = false,
  scrolled = false,
}: MobileSidebarProps) {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const { currency, setCurrency } = useCartContext();

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!session?.user?.name) return "U";

    const nameParts = session.user.name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts?.[0]?.[0] ?? ""}${nameParts?.[1]?.[0] ?? ""}`.toUpperCase();
    }
    return nameParts?.[0]?.substring(0, 2)?.toUpperCase() ?? "U";
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto p-3 lg:hidden",
            isHeroSection && !scrolled
              ? "text-white hover:bg-white/10"
              : "text-primary hover:bg-primary/10"
          )}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[80%] p-0 sm:w-[350px]">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-start border-b p-4">
            <Logo size={100} />
          </div>

          {/* Search Input in mobile menu */}
          <div className="border-b p-4">
            <form
              className="relative"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const searchQuery = formData.get("search")?.toString() || "";
                router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                setOpen(false);
              }}
            >
              <input
                type="search"
                name="search"
                placeholder="Search products..."
                autoFocus={false}
                tabIndex={-1}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 pr-24 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </form>
          </div>

          <nav className="flex flex-col">
            {/* Main Navigation Links */}
            <div className="border-b">
              <div className="flex flex-col p-4">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Button
                      asChild
                      key={link.name}
                      variant="ghost"
                      className="justify-start py-6 text-primary hover:bg-primary/10"
                      onClick={() => setOpen(false)}
                    >
                      <Link href={link.href} className="flex items-center">
                        <Icon className="mr-2 h-4 w-4" />
                        {link.name}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="border-b">
              <div className="flex flex-col p-4">
                {!isPending && session ? (
                  <>
                    <div className="mb-2 flex items-center">
                      <Avatar className="mr-2 h-8 w-8">
                        <AvatarFallback className="text-primary-foreground">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {session?.user?.name || "User"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {session?.user?.email || "No email"}
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="ghost"
                      className="justify-start py-6 text-primary hover:bg-primary/10"
                      onClick={() => setOpen(false)}
                    >
                      <Link href="/dashboard" className="flex items-center">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    {isAdmin && (
                      <Button
                        asChild
                        variant="ghost"
                        className="justify-start py-6 text-primary hover:bg-primary/10"
                        onClick={() => setOpen(false)}
                      >
                        <Link
                          href="/admin-dashboard"
                          className="flex items-center"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="justify-start py-6 text-primary hover:bg-primary/10"
                      onClick={() => {
                        handleSignOut();
                        setOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="ghost"
                      className="justify-start py-6 text-primary hover:bg-primary/10"
                      onClick={() => setOpen(false)}
                    >
                      <Link href="/login">Sign in</Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className="justify-start py-6 text-primary hover:bg-primary/10"
                      onClick={() => setOpen(false)}
                    >
                      <Link href="/register">Create account</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Currency Selector */}
            <div className="p-4">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MKD">MKD (ден)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
