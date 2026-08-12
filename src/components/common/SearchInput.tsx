import { Search } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Input } from "./Input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  label,
  className = "",
  onKeyDown,
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <Input
        label={label}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="pl-9"
        aria-label={label || placeholder}
      />
    </div>
  );
}
