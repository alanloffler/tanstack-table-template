import { ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

import type { Column } from "@tanstack/react-table";

export function SortableIcon<TData, TValue>({ column }: { column: Column<TData, TValue> }) {
  return (
    <button
      className="hover:bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {column.getIsSorted() === "asc" ? (
        <ChevronUp className="h-4 w-4 opacity-70" strokeWidth={1} />
      ) : column.getIsSorted() === "desc" ? (
        <ChevronDown className="h-4 w-4 opacity-70" strokeWidth={1} />
      ) : (
        <ChevronsUpDown className="h-4 w-4 opacity-70" strokeWidth={1} />
      )}
    </button>
  );
}
