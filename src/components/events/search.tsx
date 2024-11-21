"use client";

import { Search as SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchProps {
  placeholder?: string;
  className?: string;
}

export function Search({ placeholder = "Search events...", className }: SearchProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    
    params.set("page", "1");
    
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div 
      className={cn("group relative", className)}
      role="search"
      aria-label="Search events"
    >
      <SearchIcon 
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-9 pr-4 w-full focus-visible:ring-1"
        defaultValue={searchParams.get("query")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        aria-label={placeholder}
      />
    </div>
  );
} 