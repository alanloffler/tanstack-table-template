import { FilePdf } from "@/components/icons/FilePdf";
import { GripVertical, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DraggableColumnHeader } from "@/components/DraggableColumnHeader";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/Pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { DndContext, DragOverlay, closestCenter, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useShallow } from "zustand/shallow";
import { useState } from "react";

import { exportTableToPdf, type TPdfFormatter } from "@/utils/export-table-pdf.utils";
import { useTableStore } from "@/stores/table.store";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[] | undefined;
  defaultPageSize?: number;
  defaultSorting?: SortingState;
  exportPdfConfig?: {
    filename?: string;
    formatters?: Record<string, TPdfFormatter<TData>>;
    headers?: Record<string, string>;
    title?: string;
  };
  pageSizes?: number[];
  storageKey: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  defaultPageSize = 5,
  defaultSorting = [],
  exportPdfConfig,
  pageSizes = [5, 10, 20, 50],
  storageKey,
}: DataTableProps<TData, TValue>) {
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);
  const columnOrder = useTableStore(useShallow((state) => state.columnOrder[storageKey] ?? []));
  const setStoredColumnOrder = useTableStore((state) => state.setColumnOrder);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
    onColumnOrderChange: (updaterOrValue) => {
      const newOrder = typeof updaterOrValue === "function" ? updaterOrValue(columnOrder) : updaterOrValue;
      setStoredColumnOrder(storageKey, newOrder);
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnOrder: columnOrder,
      globalFilter: globalFilter,
      columnFilters: columnFilters,
      pagination: pagination,
      rowSelection: rowSelection,
      sorting: sorting,
    },
  });

  // useEffect(() => {
  //   console.log("Selected rows:", table.getSelectedRowModel().rows.length);
  // }, [rowSelection, table]);

  // Drag and drop column ordering
  function handleDragStart(event: DragStartEvent): void {
    setActiveColumnId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const columnIds = table.getAllLeafColumns().map((c) => c.id);
    const oldIndex = columnIds.indexOf(active.id as string);
    const newIndex = columnIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    setStoredColumnOrder(storageKey, arrayMove(columnIds, oldIndex, newIndex));
    setActiveColumnId(null);
  }

  // Clear global filter
  function handleClearSearch(): void {
    table.setGlobalFilter("");
    setGlobalFilter("");
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-5">
        <Button
          className="text-muted-foreground hover:bg-muted"
          size="icon"
          variant="outline"
          onClick={() =>
            exportTableToPdf({
              filename: exportPdfConfig?.filename,
              formatters: exportPdfConfig?.formatters,
              headers: exportPdfConfig?.headers,
              table,
              title: exportPdfConfig?.title,
            })
          }
        >
          <FilePdf className="size-5" />
        </Button>
        <div className="relative">
          <Search className="stroke-primary absolute top-1/2 left-5 h-4 w-4 -translate-x-1/2 -translate-y-1/2" />
          <Input
            value={globalFilter}
            className="w-55 pl-9"
            onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            placeholder="Buscar..."
          />
          {globalFilter ? (
            <Button
              className="absolute top-1/2 -right-1.5 -translate-x-1/2 -translate-y-1/2 active:not-aria-[haspopup]:-translate-y-1/2"
              onClick={handleClearSearch}
              size="icon-xs"
              variant="ghost"
            >
              <X />
            </Button>
          ) : null}
        </div>
      </div>
      <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Table className="dark:bg-muted w-full table-fixed">
          <TableHeader className="dark:bg-primary-foreground bg-neutral-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <SortableContext
                key={headerGroup.id}
                items={headerGroup.headers
                  .filter(
                    (h) => !(h.column.columnDef.meta as { disableDragging?: boolean } | undefined)?.disableDragging,
                  )
                  .map((h) => h.column.id)}
                strategy={rectSortingStrategy}
              >
                <TableRow>
                  {headerGroup.headers.map((header) =>
                    (header.column.columnDef.meta as { disableDragging?: boolean } | undefined)?.disableDragging ? (
                      <TableHead
                        key={header.id}
                        className="py-2.5"
                        style={{
                          minWidth: header.column.columnDef.minSize,
                          width: header.column.getSize(),
                          maxWidth: header.column.columnDef.maxSize,
                        }}
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ) : (
                      <DraggableColumnHeader header={header} key={header.id} />
                    ),
                  )}
                </TableRow>
              </SortableContext>
            ))}
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="bg-background hover:bg-background" key={`${headerGroup.id}-filters`}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={`${header.id}-filter`}
                    className="py-1.5"
                    style={{
                      minWidth: header.column.columnDef.minSize,
                      width: header.column.getSize(),
                      maxWidth: header.column.columnDef.maxSize,
                    }}
                  >
                    {header.column.getCanFilter() ? (
                      <Input
                        value={(header.column.getFilterValue() as string) ?? ""}
                        onChange={(e) => header.column.setFilterValue(e.target.value)}
                        placeholder="Buscar..."
                        className="h-7 max-w-50 text-xs"
                      />
                    ) : null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className="whitespace-normal"
                      style={{
                        minWidth: cell.column.columnDef.minSize,
                        width: cell.column.getSize(),
                      }}
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <DragOverlay>
          {activeColumnId ? (
            <div className="bg-background flex items-center gap-2 rounded-md border px-2 py-1 text-sm shadow-lg">
              <GripVertical className="text-muted-foreground h-4 w-4" />
              {table
                .getHeaderGroups()
                .map((hg) =>
                  hg.headers
                    .filter((h) => h.column.id === activeColumnId)
                    .map((h) => <span key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</span>),
                )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <Pagination table={table} pageSizes={pageSizes} />
    </section>
  );
}
