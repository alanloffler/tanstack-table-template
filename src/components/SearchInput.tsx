import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const searchInputVariants = cva("relative w-fit", {
  variants: {
    size: {
      sm: "[&_svg:first-child]:size-3 [&_svg:first-child]:left-4 [&_input]:h-7 [&_input]:pl-7 [&_input]:text-xs",
      default: "",
      lg: "[&_svg:first-child]:size-5 [&_svg:first-child]:left-6 [&_input]:h-10 [&_input]:pl-10 [&_input]:text-base",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface ISearchInput extends VariantProps<typeof searchInputVariants> {
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  value: string;
}

export function SearchInput({ className, onChange, onClear, size, value }: ISearchInput) {
  return (
    <div className={cn(searchInputVariants({ size }), className)}>
      <Search className="stroke-primary absolute top-1/2 left-5 h-4 w-4 -translate-x-1/2 -translate-y-1/2" />
      <Input value={value} className="pl-9" onChange={onChange} placeholder="Search..." />
      {value ? (
        <Button
          className="absolute top-1/2 -right-1.5 -translate-x-1/2 -translate-y-1/2 active:not-aria-[haspopup]:-translate-y-1/2"
          onClick={onClear}
          size="icon-xs"
          variant="ghost"
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}
