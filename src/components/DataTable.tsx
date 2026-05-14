import { FilePdf } from "@/components/icons/FilePdf";
import { FileXls } from "@/components/icons/FileXls";
import { Columns3Cog, GripVertical, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DraggableColumnHeader } from "@/components/DraggableColumnHeader";
import { Pagination } from "@/components/Pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchInput } from "@/components/SearchInput";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
import { useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";

import { exportTableToPdf, type TPdfFormatter } from "@/utils/export-table-pdf.utils";
import { exportTableToXls, type TXlsFormatter } from "@/utils/export-table-xls.utils";
import { useTableStore } from "@/stores/table.store";

export interface ITableOptions {
  columnSearch?: boolean;
  dragAndDrop?: boolean;
  exportPdf?: boolean;
  exportXls?: boolean;
  globalSearch?: boolean;
  hideColumns?: boolean;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[] | undefined;
  defaultPageSize?: number;
  defaultSorting?: SortingState;
  exportPdfConfig?: {
    filename?: string;
    formatters?: Record<string, TPdfFormatter<TData>>;
    title?: string;
  };
  exportXlsConfig?: {
    filename?: string;
    formatters?: Record<string, TXlsFormatter<TData>>;
    sheetName?: string;
  };
  loading?: boolean;
  options?: ITableOptions;
  pageSizes?: number[];
  storageKey: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  defaultPageSize = 5,
  defaultSorting = [],
  exportPdfConfig,
  exportXlsConfig,
  loading,
  options,
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
  const clearTableStore = useTableStore((state) => state.clearTable);
  const columnOrder = useTableStore(useShallow((state) => state.tables[storageKey]?.columnOrder ?? []));
  const columnVisibility = useTableStore(useShallow((state) => state.tables[storageKey]?.columnVisibility ?? {}));
  const setStoredColumnOrder = useTableStore((state) => state.setColumnOrder);
  const setColumnVisibility = useTableStore((state) => state.setColumnVisibility);

  const tableData = useMemo(
    () => (loading ? Array(defaultPageSize).fill({}) : (data ?? [])),
    [data, defaultPageSize, loading],
  );
  const tableColumns = useMemo(
    () =>
      loading
        ? columns.map((column) => ({
            ...column,
            cell: () => <Skeleton className="h-6 w-full" />,
          }))
        : columns,
    [loading, columns],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: tableData ?? [],
    columns: tableColumns,
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
    onColumnVisibilityChange: (updaterOrValue) => {
      const newVisibility = typeof updaterOrValue === "function" ? updaterOrValue(columnVisibility) : updaterOrValue;
      setColumnVisibility(storageKey, newVisibility);
    },
    state: {
      columnOrder: columnOrder,
      columnVisibility: columnVisibility,
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

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-5">
        <div className="flex items-center gap-2">
          {options?.exportPdf && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="text-muted-foreground hover:bg-muted"
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    exportTableToPdf({
                      filename: exportPdfConfig?.filename,
                      formatters: exportPdfConfig?.formatters,
                      table,
                      title: exportPdfConfig?.title,
                    })
                  }
                >
                  <FilePdf className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportar PDF</TooltipContent>
            </Tooltip>
          )}
          {options?.exportXls && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="text-muted-foreground hover:bg-muted"
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    exportTableToXls({
                      filename: exportXlsConfig?.filename,
                      formatters: exportXlsConfig?.formatters,
                      sheetName: exportXlsConfig?.sheetName,
                      table,
                    })
                  }
                >
                  <FileXls className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportar XLS</TooltipContent>
            </Tooltip>
          )}
          {(options?.hideColumns || options?.dragAndDrop) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="text-muted-foreground hover:bg-muted"
                  onClick={() => clearTableStore(storageKey)}
                  size="icon"
                  variant="outline"
                >
                  <RefreshCcw />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Resetear tabla</TooltipContent>
            </Tooltip>
          )}
          {options?.hideColumns && (
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button className="text-muted-foreground hover:bg-muted" size="icon" variant="outline">
                      <Columns3Cog />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Seleccionar columnas</TooltipContent>
              </Tooltip>
              <PopoverContent className="max-h-50 w-fit overflow-y-auto">
                {table.getAllLeafColumns().map((column) => (
                  <label key={column.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={column.getIsVisible()}
                      onCheckedChange={(checked) => column.toggleVisibility(!!checked)}
                    />
                    {column.id}
                  </label>
                ))}
              </PopoverContent>
            </Popover>
          )}
        </div>
        {options?.globalSearch && (
          <SearchInput
            onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            onClear={() => {
              table.setGlobalFilter("");
              setGlobalFilter("");
            }}
            value={globalFilter}
          />
        )}
      </div>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={(e) => options?.dragAndDrop && handleDragStart(e)}
        onDragEnd={(e) => options?.dragAndDrop && handleDragEnd(e)}
      >
        <Table className="dark:bg-card w-full table-fixed">
          <TableHeader className="dark:bg-primary-foreground/50 bg-neutral-100">
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
                  {headerGroup.headers.map((header) => {
                    const disableDragging = (header.column.columnDef.meta as { disableDragging?: boolean } | undefined)
                      ?.disableDragging;
                    return options?.dragAndDrop && !disableDragging ? (
                      <DraggableColumnHeader header={header} key={header.id} />
                    ) : (
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
                    );
                  })}
                </TableRow>
              </SortableContext>
            ))}
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="bg-card hover:bg-card" key={`${headerGroup.id}-filters`}>
                {options?.columnSearch &&
                  headerGroup.headers.map((header) => (
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
                        <SearchInput
                          className="w-35"
                          onChange={(e) => header.column.setFilterValue(e.target.value)}
                          onClear={() => {
                            header.column.setFilterValue("");
                          }}
                          size="sm"
                          value={(header.column.getFilterValue() as string) ?? ""}
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
        {options?.dragAndDrop && (
          <DragOverlay>
            {activeColumnId ? (
              <div className="bg-background flex min-h-10.5 items-center gap-2 rounded-md border px-2 py-1 text-sm shadow-lg">
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
        )}
      </DndContext>
      {!loading && <Pagination table={table} pageSizes={pageSizes} />}
    </section>
  );
}
