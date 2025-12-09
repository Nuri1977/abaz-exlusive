"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCartContext } from "@/context/CartContext";
import { useUserAccountContext } from "@/context/UserAccountContext";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  User,
} from "lucide-react";

import { navLinks } from "@/constants/routes";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const hasHeroSection = pathname === "/";
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { likedProducts } = useUserAccountContext();
  const { currency, setCurrency } = useCartContext();
  const likedCount = likedProducts?.length || 0;
  const { data: session, isPending } = authClient.useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          onError: () => {
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
    return nameParts?.[0]?.substring(0, 2)?.toUpperCase() ?? "U";
  };

  return (
    <header
      className={cn(
        "top-0 z-50 w-full transition-all duration-300",
        hasHeroSection ? "fixed left-0 right-0" : "sticky border-b",
        hasHeroSection && !scrolled
          ? "bg-transparent"
          : "bg-background/70 shadow-sm supports-[backdrop-filter]:backdrop-blur-md"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex cursor-pointer items-center gap-2">
          <Logo size={70} />
        </Link>

        <div className="flex items-center gap-3">
          {/* Desktop Navigation */}
          <nav className="hidden gap-2 lg:flex">
            {navLinks.map((link) => (
              <Button
                asChild
                key={link.name}
                variant="ghost"
                className={cn(
                  "transition-colors",
                  hasHeroSection && !scrolled
                    ? "text-white hover:bg-white/20"
                    : "text-primary hover:bg-primary/20"
                )}
              >
                <Link href={link.href}>{link.name}</Link>
              </Button>
            ))}
          </nav>

          {/* Search Icon - Hidden on mobile/tablet */}
          <div className="hidden p-2 lg:block">
            <Link
              href="/search"
              className={cn(
                "transition-colors",
                hasHeroSection && !scrolled
                  ? "text-white hover:text-white/90"
                  : "text-primary hover:text-primary/90"
              )}
            >
              <Search size={24} />
              <span className="sr-only">Search</span>
            </Link>
          </div>

          {/* Likes and Cart Icons */}
          {session ? (
            <Link
              href="/dashboard/likes"
              className={cn(
                "relative p-2 transition-colors",
                hasHeroSection && !scrolled
                  ? "text-white hover:text-white/90"
                  : "text-primary hover:text-primary/90"
              )}
            >
              <Heart size={24} />
              <span className="sr-only">Likes</span>
              {likedCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-destructive-foreground">
                  {likedCount > 99 ? "99+" : likedCount}
                </span>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className={cn(
                "p-2 transition-colors",
                hasHeroSection && !scrolled
                  ? "text-white hover:text-white/90"
                  : "text-primary hover:text-primary/90"
              )}
            >
              <Heart size={24} />
              <span className="sr-only">Likes</span>
            </Link>
          )}

          <CartSheet hasHeroSection={hasHeroSection} scrolled={scrolled} />

          {/* Currency Selector */}
          <div className="hidden items-center gap-2 lg:flex">
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger
                className={cn(
                  "h-8 w-32 text-xs",
                  hasHeroSection && !scrolled
                    ? "border-white/20 text-white"
                    : "border-input text-primary"
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MKD">MKD (ден)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Auth Section - Simplified to prevent infinite loops */}
          <div className="hidden lg:block">
            {!mounted || isPending ? (
              <div
                className={cn(
                  "size-9 animate-pulse rounded-full border p-2",
                  hasHeroSection && !scrolled
                    ? "border-white/20 bg-white/20"
                    : "border-input bg-muted/20"
                )}
              />
            ) : session ? (
              <Link
                href="/dashboard"
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border p-0 transition-colors",
                  hasHeroSection && !scrolled
                    ? "border-white/20 hover:bg-white/10"
                    : "border-input hover:bg-primary/10"
                )}
                title={`Welcome, ${session?.user?.name || "User"}`}
              >
                <Avatar className="size-8">
                  <AvatarFallback
                    className={cn(
                      hasHeroSection && !scrolled
                        ? "bg-white/20 text-white"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link
                href="/login"
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border p-0 transition-colors",
                  hasHeroSection && !scrolled
                    ? "border-white/20 hover:bg-white/10"
                    : "border-input hover:bg-primary/10"
                )}
                title="Sign in"
              >
                <User
                  className={cn(
                    "size-5",
                    hasHeroSection && !scrolled ? "text-white" : "text-primary"
                  )}
                />
              </Link>
            )}
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
