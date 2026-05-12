import { TableHead } from "@/components/ui/table";

import { flexRender, type Header } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";

export function DraggableColumnHeader<TData, TValue>({ header }: { header: Header<TData, TValue> }) {
  const { attributes, isDragging, listeners, setNodeRef } = useSortable({
    id: header.column.id,
  });

  return (
    <TableHead
      className="cursor-grab active:cursor-grabbing"
      ref={setNodeRef}
      style={{
        minWidth: header.column.columnDef.minSize,
        width: header.column.getSize(),
        maxWidth: header.column.columnDef.maxSize,
        opacity: isDragging ? 0.5 : 1,
        position: "relative",
      }}
      {...attributes}
      {...listeners}
    >
      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
    </TableHead>
  );
}
