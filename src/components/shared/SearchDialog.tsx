"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";

export function SearchDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Reset query when dialog opens and sync with URL if on search page
  useEffect(() => {
    if (open) {
      // If we're on the search page, use the current search query
      if (pathname === "/search") {
        setQuery(searchParams?.get("q") || "");
      } else {
        setQuery("");
      }
    }
  }, [open, pathname, searchParams]);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery?.trim()) {
        toast({
          title: "Please enter a search term",
          variant: "destructive",
        });
        return;
      }

      setOpen(false);

      const trimmedQuery = searchQuery?.trim();
      const params = new URLSearchParams();
      params?.set("q", trimmedQuery);

      if (pathname === "/search") {
        // If we're already on the search page, use replace to avoid adding to history
        router.replace(`/search?${params?.toString()}`);
      } else {
        // If we're on a different page, use push to navigate to search
        router.push(`/search?${params?.toString()}`);
      }
    },
    [pathname, router, toast]
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch(query);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary-foreground">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
          <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="left-0 top-0 flex max-w-full translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-b p-0">
        <div className="container mx-auto w-full px-4 py-8">
          <DialogHeader className="mb-8">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">Search Products</DialogTitle>
            </div>
          </DialogHeader>
          <form onSubmit={onSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-14 pl-12 pr-12 text-lg"
              autoComplete="off"
              autoFocus
            />
            <kbd className="pointer-events-none absolute right-4 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              press ↵ to search
            </kbd>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
