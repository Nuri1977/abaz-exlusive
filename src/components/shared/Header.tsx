"use client";

import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu, User, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/helpers/isAdminClient";
import { navLinks } from "@/utils/constants";
import { Skeleton } from "@/components/ui/skeleton";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isAdmin = useIsAdmin();

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
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0].substring(0, 2).toUpperCase();
  };

  // Rest of the component remains unchanged
  return (
    <header
      className={`w-full border-b backdrop-blur sticky top-0 z-30 shadow-sm transition-all duration-300 bg-black text-white`}
    >
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link href="/" className="cursor-pointer flex items-center gap-2">
          <Logo size={160} />
        </Link>
        <div className="flex items-center gap-3">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-2">
            {navLinks.map((link) => (
              <Button
                asChild
                key={link.name}
                variant="ghost"
                className="text-white hover:text-gray-300 hover:bg-white/10"
              >
                <Link href={link.href}>{link.name}</Link>
              </Button>
            ))}
          </nav>

          {/* Auth Dropdown - Hidden on mobile */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full border h-9 w-9 p-0"
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
                      <p className="text-xs text-muted-foreground truncate">
                        {session?.user?.email || "No email"}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard"
                        className="w-full cursor-pointer flex items-center"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin-dashboard"
                          className="w-full cursor-pointer flex items-center"
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

          {/* Mobile Menu Trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden p-3 h-auto">
                <Menu className="h-10 w-10" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[350px] p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-start p-4 border-b">
                  <Logo size={200} />
                </div>
                <nav className="flex flex-col p-4 gap-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Button
                        asChild
                        key={link.name}
                        variant="ghost"
                        className="justify-start text-primary hover:bg-primary/10 py-6"
                        onClick={() => setOpen(false)}
                      >
                        <Link href={link.href} className="flex items-center">
                          <Icon className="mr-2 h-4 w-4" />
                          {link.name}
                        </Link>
                      </Button>
                    );
                  })}

                  {/* Auth buttons for mobile menu */}
                  {!isPending && session ? (
                    <>
                      <Button
                        asChild
                        variant="ghost"
                        className="justify-start text-primary hover:bg-primary/10 py-6"
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
                          className="justify-start text-primary hover:bg-primary/10 py-6"
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
                        className="justify-start text-primary hover:bg-primary/10 py-6"
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
                        className="justify-start text-primary hover:bg-primary/10 py-6"
                        onClick={() => setOpen(false)}
                      >
                        <Link href="/login">Sign in</Link>
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        className="justify-start text-primary hover:bg-primary/10 py-6"
                        onClick={() => setOpen(false)}
                      >
                        <Link href="/register">Create account</Link>
                      </Button>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
