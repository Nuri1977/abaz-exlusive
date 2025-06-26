"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartContext } from "@/context/CartContext";
import { useUserAccountContext } from "@/context/UserAccountContext";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";

import { navLinks } from "@/constants/routes";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/useToast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import Logo from "@/components/shared/Logo";
import { useIsAdmin } from "@/helpers/isAdminClient";

import { CartSheet } from "../cart/CartSheet";
import { MobileSidebar } from "../Header/MobileSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function Header() {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { likedProducts } = useUserAccountContext();
  const { currency, setCurrency } = useCartContext();
  const likedCount = likedProducts.length;

  // Use Better Auth's useSession hook for proper session management
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onRequest: () => {
            // Optional loading state
          },
          onSuccess: () => {
            router.push("/");
            router.refresh();
            toast({
              title: "Signed out",
              description: "You have been signed out successfully.",
              duration: 3000,
            });
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: "Failed to sign out. Please try again.",
              variant: "destructive",
              duration: 5000,
            });
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

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
    <header
      className={`sticky top-0 z-50 w-full shadow-sm backdrop-blur transition-all duration-300 ${
        scrolled ? "bg-black/80" : "bg-black"
      } text-white`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex cursor-pointer items-center gap-2">
          <Logo size={160} />
        </Link>
        <div className="flex items-center gap-3">
          {/* Desktop Navigation */}
          <nav className="hidden gap-2 lg:flex">
            {navLinks.map((link) => (
              <Button
                asChild
                key={link.name}
                variant="ghost"
                className="text-primary-foreground hover:bg-[#6c7280]/10 hover:text-primary-foreground/90"
              >
                <Link href={link.href}>{link.name}</Link>
              </Button>
            ))}
          </nav>

          {/* Search Icon - Hidden on mobile/tablet */}
          <div className="hidden lg:block">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-primary-foreground"
            >
              <Link href="/search">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Link>
            </Button>
          </div>

          {/* Likes and Cart Icons - Visible on all devices */}
          {session ? (
            <Link
              href="/dashboard/likes"
              className="relative p-2 text-primary-foreground transition-colors hover:text-primary-foreground/90"
            >
              <Heart size={24} />
              <span className="sr-only">Likes</span>
              {likedCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                  {likedCount > 99 ? "99+" : likedCount}
                </span>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="p-2 text-primary-foreground transition-colors hover:text-primary-foreground/90"
            >
              <Heart size={24} />
              <span className="sr-only">Likes</span>
            </Link>
          )}

          <CartSheet />

          {/* Currency Selector - Hidden on mobile/tablet */}
          <div className="hidden items-center gap-2 lg:flex">
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-30 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MKD">MKD (ден)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Auth Dropdown - Hidden on mobile/tablet */}
          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full border p-0"
                >
                  {isPending ? (
                    <Skeleton className="h-8 w-8 rounded-full bg-muted-foreground/20" />
                  ) : session ? (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {!isPending && session ? (
                  <>
                    <div className="p-2 text-center">
                      <p className="font-medium">
                        {session?.user?.name || "User"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {session?.user?.email || "No email"}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard"
                        className="flex w-full cursor-pointer items-center"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin-dashboard"
                          className="flex w-full cursor-pointer items-center"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="w-full cursor-pointer">
                        Sign in
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register" className="w-full cursor-pointer">
                        Create account
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Sidebar */}
          <MobileSidebar
            open={open}
            setOpen={setOpen}
            session={session}
            isPending={isPending}
            handleSignOut={handleSignOut}
          />
        </div>
      </div>
    </header>
  );
}
