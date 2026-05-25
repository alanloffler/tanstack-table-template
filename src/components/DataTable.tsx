import { FilePdf } from "@/components/icons/FilePdf";
import { FileXls } from "@/components/icons/FileXls";
import { Columns3Cog, GripVertical, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { DraggableColumnHeader } from "@/components/DraggableColumnHeader";
import { Pagination } from "@/components/Pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchInput } from "@/components/SearchInput";
import { Skeleton } from "@/components/ui/skeleton";
import { SortableContext } from "@dnd-kit/sortable";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { closestCenter, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSizingState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";

import { cn } from "@/lib/utils";
import { exportTableToPdf, type TPdfFormatter } from "@/utils/export-table-pdf.utils";
import { exportTableToXls, type TXlsFormatter } from "@/utils/export-table-xls.utils";
import { useTableStore } from "@/stores/table.store";

export interface ITableOptions {
  columnSearch?: boolean;
  columnSizing?: boolean;
  dragAndDrop?: boolean;
  exportPdf?: boolean;
  exportXls?: boolean;
  globalSearch?: boolean;
  hideColumns?: boolean;
  showTooltips?: boolean;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);
  const clearTableStore = useTableStore((state) => state.clearTable);
  const columnOrder = useTableStore(useShallow((state) => state.tables[storageKey]?.columnOrder ?? []));
  const columnSizing = useTableStore(useShallow((state) => state.tables[storageKey]?.columnSizing ?? {}));
  const columnVisibility = useTableStore(useShallow((state) => state.tables[storageKey]?.columnVisibility ?? {}));
  const setStoredColumnOrder = useTableStore((state) => state.setColumnOrder);
  const setStoredColumnSizing = useTableStore((state) => state.setColumnSizing);
  const setStoredColumnVisibility = useTableStore((state) => state.setColumnVisibility);

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
    columnResizeMode: "onChange",
    defaultColumn: { minSize: 40 },
    onColumnSizingChange: (updateOrValue) => {
      const newSizing = typeof updateOrValue === "function" ? updateOrValue(columnSizing) : updateOrValue;
      setStoredColumnSizing(storageKey, newSizing);
    },
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
      setStoredColumnVisibility(storageKey, newVisibility);
    },
    state: {
      columnOrder: columnOrder,
      columnSizing: columnSizing,
      columnVisibility: columnVisibility,
      globalFilter: globalFilter,
      columnFilters: columnFilters,
      pagination: pagination,
      rowSelection: rowSelection,
      sorting: sorting,
    },
  });

  const computeDefaultSizing = useCallback((): ColumnSizingState | null => {
    const container = containerRef.current;
    if (!container) return null;
    const width = container.offsetWidth;
    if (width === 0) return null;
    const visibleCols = table.getAllLeafColumns().filter((c) => c.getIsVisible());
    if (visibleCols.length === 0) return null;
    const totalWeight = visibleCols.reduce((sum, c) => sum + (c.columnDef.size ?? 150), 0);
    const sizing: ColumnSizingState = {};
    visibleCols.forEach((c) => {
      sizing[c.id] = Math.floor(((c.columnDef.size ?? 150) / totalWeight) * width);
    });
    return sizing;
  }, [table]);

  useEffect(() => {
    if (Object.keys(columnSizing).length > 0) return;
    const sizing = computeDefaultSizing();
    if (sizing) setStoredColumnSizing(storageKey, sizing);
  }, [columnSizing, computeDefaultSizing, setStoredColumnSizing, storageKey]);

  const isResizing = !!table.getState().columnSizingInfo.isResizingColumn;

  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: Record<string, number> = {};
    for (const header of headers) {
      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }
    return colSizes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getState().columnSizingInfo, table.getState().columnSizing]);

  const visibleColumns = table.getVisibleLeafColumns();
  const fixedColumnsWidth = visibleColumns.slice(0, -1).reduce((sum, c) => sum + c.getSize(), 0);
  const lastColumnMinSize = visibleColumns[visibleColumns.length - 1]?.columnDef.minSize ?? 40;

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
    <section ref={containerRef} className={cn("flex flex-col gap-3", isResizing && "cursor-col-resize select-none")}>
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
              <TooltipContent hidden={!options?.showTooltips}>Exportar PDF</TooltipContent>
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
              <TooltipContent hidden={!options?.showTooltips}>Exportar XLS</TooltipContent>
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
              <TooltipContent hidden={!options?.showTooltips}>Resetear tabla</TooltipContent>
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
                <TooltipContent hidden={!options?.showTooltips}>Seleccionar columnas</TooltipContent>
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
        <div className="overflow-x-auto">
          <Table
            className="dark:bg-card table-fixed"
            style={{ ...columnSizeVars, width: "100%", minWidth: fixedColumnsWidth + lastColumnMinSize }}
          >
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
                    {headerGroup.headers.map((header, index) => {
                      const disableDragging = (
                        header.column.columnDef.meta as { disableDragging?: boolean } | undefined
                      )?.disableDragging;
                      const isLastColumn = index === headerGroup.headers.length - 1;
                      return options?.dragAndDrop && !disableDragging ? (
                        <DraggableColumnHeader
                          header={header}
                          isLastColumn={isLastColumn}
                          columnSizing={options?.columnSizing}
                          key={header.id}
                        />
                      ) : (
                        <TableHead
                          key={header.id}
                          className="relative overflow-hidden py-2.5"
                          style={{
                            minWidth: header.column.columnDef.minSize,
                            width: isLastColumn ? "auto" : `calc(var(--header-${header.id}-size) * 1px)`,
                            maxWidth: isLastColumn ? undefined : header.column.columnDef.maxSize,
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {!isLastColumn && options?.columnSizing && (
                            <div
                              onDoubleClick={() => header.column.resetSize()}
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={`hover:bg-primary/50 active:bg-primary absolute top-0 right-0 h-full w-0.75 cursor-col-resize touch-none bg-transparent transition-colors select-none ${header.column.getIsResizing() ? "bg-primary" : ""}`}
                            />
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </SortableContext>
              ))}
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow className="bg-card hover:bg-card" key={`${headerGroup.id}-filters`}>
                  {options?.columnSearch &&
                    headerGroup.headers.map((header, index) => {
                      const isLastColumn = index === headerGroup.headers.length - 1;
                      return (
                        <TableHead
                          key={`${header.id}-filter`}
                          className="overflow-x-hidden border-r py-1.5 last:border-none"
                          style={{
                            minWidth: header.column.columnDef.minSize,
                            width: isLastColumn ? "auto" : `calc(var(--header-${header.id}-size) * 1px)`,
                            maxWidth: isLastColumn ? undefined : header.column.columnDef.maxSize,
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
                      );
                    })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell, index) => {
                      const isLastColumn = index === row.getVisibleCells().length - 1;
                      return (
                        <TableCell
                          className="overflow-hidden border-r whitespace-normal last:border-none"
                          style={{
                            minWidth: cell.column.columnDef.minSize,
                            width: isLastColumn ? "auto" : `calc(var(--col-${cell.column.id}-size) * 1px)`,
                          }}
                          key={cell.id}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
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
        </div>
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
