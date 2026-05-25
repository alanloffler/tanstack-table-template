import { TableHead } from "@/components/ui/table";

import { flexRender, type Header } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/sortable";

export function DraggableColumnHeader<TData, TValue>({
  header,
  isLastColumn,
  columnSizing,
}: {
  header: Header<TData, TValue>;
  isLastColumn?: boolean;
  columnSizing?: boolean;
}) {
  const { attributes, isDragging, listeners, setNodeRef } = useSortable({
    id: header.column.id,
  });

  return (
    <TableHead
      className="relative overflow-hidden py-2.5"
      ref={setNodeRef}
      style={{
        minWidth: header.column.columnDef.minSize,
        width: isLastColumn ? "auto" : `calc(var(--header-${header.id}-size) * 1px)`,
        maxWidth: isLastColumn ? undefined : header.column.columnDef.maxSize,
        textAlign: header.column.columnDef.meta?.alignment ?? "left",
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {header.isPlaceholder ? null : (
        <span className="inline-flex w-fit cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
          {flexRender(header.column.columnDef.header, header.getContext())}
        </span>
      )}
      {!isLastColumn && columnSizing && (
        <div
          onDoubleClick={() => header.column.resetSize()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => {
            e.stopPropagation();
            header.getResizeHandler()(e);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            header.getResizeHandler()(e);
          }}
          className={`hover:bg-primary/50 active:bg-primary absolute top-0 right-0 h-full w-0.75 cursor-col-resize touch-none bg-transparent transition-colors select-none ${
            header.column.getIsResizing() ? "bg-primary" : ""
          }`}
        />
      )}
    </TableHead>
  );
}
