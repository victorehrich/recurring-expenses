import { Search } from "lucide-react";
import { Input, type InputProps } from "@/components/atoms";

export function SearchBar(props: InputProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <Input {...props} className="pl-9" />
    </div>
  );
}
