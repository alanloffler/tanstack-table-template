import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/Pagination";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
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
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
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

  function handleClearSearch(): void {
    table.setGlobalFilter("");
    setGlobalFilter("");
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-5 justify-between">
        <Button
          onClick={() =>
            console.log(
              `Items: ${JSON.stringify(table.getFilteredSelectedRowModel().rows.length)}`,
            )
          }
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
              className="active:not-aria-[haspopup]:-translate-y-1/2 absolute top-1/2 -right-1.5 -translate-x-1/2 -translate-y-1/2"
              onClick={handleClearSearch}
              size="icon-xs"
              variant="ghost"
            >
              <X />
            </Button>
          ) : null}
        </div>
      </div>
      <Table className="dark:bg-muted table-fixed w-full">
        <TableHeader className="dark:bg-primary-foreground bg-neutral-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    className="py-2.5"
                    key={header.id}
                    style={{
                      minWidth: header.column.columnDef.minSize,
                      width: header.column.getSize(),
                      maxWidth: header.column.columnDef.maxSize,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              className="dark:bg-background bg-background hover:bg-background"
              key={`${headerGroup.id}-filters`}
            >
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
                      className="h-7 text-xs max-w-36"
                      onChange={(e) =>
                        header.column.setFilterValue(e.target.value)
                      }
                      placeholder="Buscar..."
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
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
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
