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
import LogoWhite from "@/components/shared/LogoWhite";
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

interface HeroHeaderProps {
  settings?: any;
}

export function HeroHeader({ settings }: HeroHeaderProps) {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { likedProducts } = useUserAccountContext();
  const { currency, setCurrency } = useCartContext();
  const likedCount = likedProducts?.length || 0;
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
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
    <header className="fixed left-0 right-0 top-0 z-50 w-full">
      <div
        className={cn(
          "w-full transition-all duration-300",
          scrolled
            ? "bg-background/90 shadow-sm supports-[backdrop-filter]:backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        {!scrolled ? (
          // Centered Layout (when not scrolled)
          <div className="container mx-auto px-4 py-6">
            {/* Top Row - Search, User, Cart on right - Hidden on mobile */}
            <div className="mb-6 hidden items-center justify-end lg:flex">
              <div className="flex items-center gap-4">
                {/* Search Icon */}
                <Link
                  href="/search"
                  className="text-white transition-colors hover:text-white/80"
                >
                  <Search size={20} />
                  <span className="sr-only">Search</span>
                </Link>

                {/* User Account */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-full p-0 hover:bg-white/10"
                    >
                      {isPending ? (
                        <Skeleton className="size-6 rounded-full bg-white/20" />
                      ) : session ? (
                        <Avatar className="size-6">
                          <AvatarFallback className="bg-white/20 text-xs text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <User className="size-4 text-white" />
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
                            <LayoutDashboard className="mr-2 size-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem asChild>
                            <Link
                              href="/admin-dashboard"
                              className="flex w-full cursor-pointer items-center"
                            >
                              <Settings className="mr-2 size-4" />
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          className="cursor-pointer"
                        >
                          <LogOut className="mr-2 size-4" />
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
                          <Link
                            href="/register"
                            className="w-full cursor-pointer"
                          >
                            Create account
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Likes */}
                {session ? (
                  <Link
                    href="/dashboard/likes"
                    className="relative text-white transition-colors hover:text-white/80"
                  >
                    <Heart size={20} />
                    <span className="sr-only">Likes</span>
                    {likedCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                        {likedCount > 99 ? "99+" : likedCount}
                      </span>
                    )}
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="text-white transition-colors hover:text-white/80"
                  >
                    <Heart size={20} />
                    <span className="sr-only">Likes</span>
                  </Link>
                )}

                {/* Cart */}
                <CartSheet hasHeroSection={true} scrolled={false} />
              </div>
            </div>

            {/* Center Content - Logo and Company Name */}
            <div className="mb-3 text-center">
              <Link href="/" className="inline-block">
                <div className="mb-1">
                  <LogoWhite size={160} />
                </div>
              </Link>
            </div>

            {/* Navigation - Hidden on mobile */}
            <nav className="hidden justify-center lg:flex">
              <div className="flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm font-light tracking-wider text-white transition-colors hover:text-white/80"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Mobile Sidebar - positioned in top right */}
            <div className="absolute right-4 top-4 lg:hidden">
              <MobileSidebar
                open={open}
                setOpen={setOpen}
                session={session}
                isPending={isPending}
                handleSignOut={handleSignOut}
                isHeroSection={true}
                scrolled={false}
              />
            </div>
          </div>
        ) : (
          // Single Row Layout (when scrolled - like regular header)
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
                    className="text-primary transition-colors hover:bg-primary/20"
                  >
                    <Link href={link.href}>{link.name}</Link>
                  </Button>
                ))}
              </nav>

              {/* Search Icon - Hidden on mobile/tablet */}
              <div className="hidden p-2 lg:block">
                <Link
                  href="/search"
                  className="text-primary transition-colors hover:text-primary/90"
                >
                  <Search size={24} />
                  <span className="sr-only">Search</span>
                </Link>
              </div>

              {/* Likes and Cart Icons */}
              {session ? (
                <Link
                  href="/dashboard/likes"
                  className="relative p-2 text-primary transition-colors hover:text-primary/90"
                >
                  <Heart size={24} />
                  <span className="sr-only">Likes</span>
                  {likedCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                      {likedCount > 99 ? "99+" : likedCount}
                    </span>
                  )}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="p-2 text-primary transition-colors hover:text-primary/90"
                >
                  <Heart size={24} />
                  <span className="sr-only">Likes</span>
                </Link>
              )}

              <CartSheet hasHeroSection={true} scrolled={true} />

              {/* Currency Selector */}
              <div className="hidden items-center gap-2 lg:flex">
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="h-8 w-32 border border-input text-xs text-primary">
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
                      className="size-9 rounded-full border p-0 hover:bg-primary/10"
                    >
                      {isPending ? (
                        <Skeleton className="size-8 rounded-full bg-muted/20" />
                      ) : session ? (
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <User className="size-5 text-primary" />
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
                            <LayoutDashboard className="mr-2 size-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem asChild>
                            <Link
                              href="/admin-dashboard"
                              className="flex w-full cursor-pointer items-center"
                            >
                              <Settings className="mr-2 size-4" />
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          className="cursor-pointer"
                        >
                          <LogOut className="mr-2 size-4" />
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
                          <Link
                            href="/register"
                            className="w-full cursor-pointer"
                          >
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
                isHeroSection={true}
                scrolled={true}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
