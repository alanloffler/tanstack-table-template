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
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[] | undefined;
  defaultPageSize?: number;
  defaultSorting?: SortingState;
  pageSizes?: number[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  defaultPageSize = 5,
  defaultSorting = [],
  pageSizes = [5, 10, 20, 50],
}: DataTableProps<TData, TValue>) {
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
    onColumnOrderChange: setColumnOrder,
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

    setColumnOrder(arrayMove(columnIds, oldIndex, newIndex));
    setActiveColumnId(null);
  }

  // Clear global filter
  function handleClearSearch(): void {
    table.setGlobalFilter("");
    setGlobalFilter("");
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-5">
        <Button
          onClick={() => console.log(`Items: ${JSON.stringify(table.getFilteredSelectedRowModel().rows.length)}`)}
          variant="secondary"
        >
          Action
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
      <Table className="dark:bg-muted w-full table-fixed">
        <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <TableHeader className="dark:bg-primary-foreground bg-neutral-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <SortableContext
                key={headerGroup.id}
                items={headerGroup.headers.map((h) => h.column.id)}
                strategy={rectSortingStrategy}
              >
                <TableRow>
                  {headerGroup.headers.map((header) => (
                    <DraggableColumnHeader header={header} key={header.id} />
                  ))}
                </TableRow>
              </SortableContext>
            ))}
            {/* filter row stays exactly as-is */}
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={`${headerGroup.id}-filters`}>
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
                        placeholder="Filtrar..."
                        className="h-7 text-xs"
                      />
                    ) : null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <DragOverlay>
            {activeColumnId ? (
              <div className="bg-background flex items-center gap-2 rounded-md border px-2 py-1 shadow-lg">
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
      <Pagination table={table} pageSizes={pageSizes} />
    </section>
  );
}
