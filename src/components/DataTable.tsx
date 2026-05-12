import { Button } from "@/components/ui/button";
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
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
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
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      pagination: pagination,
      rowSelection: rowSelection,
      sorting: sorting,
    },
  });

  // useEffect(() => {
  //   console.log("Selected rows:", table.getSelectedRowModel().rows.length);
  // }, [rowSelection, table]);

  return (
    <section className="flex flex-col gap-3">
      <div>
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
