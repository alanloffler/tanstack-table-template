import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, type ITableOptions } from "@/components/DataTable";
import { SortableIcon } from "@/components/SortableIcon";

import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { DataService, type ICharacter } from "@/services/data.service";

const INIT_OPTS: ITableOptions = {
  columnSearch: false,
  dragAndDrop: false,
  exportPdf: false,
  exportXls: false,
  globalSearch: false,
  hideColumns: false,
};

export default function App() {
  const [tableOptions, setTableOptions] = useState(INIT_OPTS);
  const data = DataService.get();

  const columns: ColumnDef<ICharacter>[] = [
    {
      accessorKey: "select-col",
      id: "Seleccionar",
      size: 20,
      enableColumnFilter: false,
      meta: {
        disableExport: true,
        disableDragging: true,
      },
      header: ({ table }) => (
        <Checkbox
          className="bg-background border-foreground/30"
          checked={table.getIsAllRowsSelected() ? true : table.getIsSomeRowsSelected() ? "indeterminate" : false}
          onCheckedChange={(checked) => table.toggleAllRowsSelected(!!checked)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        />
      ),
    },
    {
      accessorKey: "id",
      id: "ID",
      size: 40,
      enableColumnFilter: false,
      meta: { disableDragging: true },
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span>{column.id}</span>
          <SortableIcon column={column} />
        </div>
      ),
    },
    {
      accessorKey: "name",
      id: "Nombre",
      size: 80,
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span>{column.id}</span>
          <SortableIcon column={column} />
        </div>
      ),
    },
    {
      accessorKey: "occupation",
      id: "Ocupación",
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span>{column.id}</span>
          <SortableIcon column={column} />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="border-border border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-6">
          <h1 className="text-lg font-semibold tracking-tight">Tanstack Table</h1>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-8">
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium tracking-tight">Opciones de la tabla:</h2>
          <div className="flex gap-10 text-sm">
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-2">
                <Checkbox
                  id="export-pdf"
                  checked={tableOptions?.exportPdf ?? false}
                  onCheckedChange={(checked) => setTableOptions({ ...tableOptions, exportPdf: !!checked })}
                />
                <label htmlFor="export-pdf">Exportar PDF</label>
              </li>
              <li className="flex items-center gap-2">
                <Checkbox
                  id="export-xls"
                  checked={tableOptions?.exportXls ?? false}
                  onCheckedChange={(checked) => setTableOptions({ ...tableOptions, exportXls: !!checked })}
                />
                <label htmlFor="export-xls">Exportar XLS</label>
              </li>
            </ul>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-2">
                <Checkbox
                  id="drag-and-drop"
                  checked={tableOptions?.dragAndDrop ?? false}
                  onCheckedChange={(checked) => setTableOptions({ ...tableOptions, dragAndDrop: !!checked })}
                />
                <label htmlFor="drag-and-drop">Ordenar columnas</label>
              </li>
              <li className="flex items-center gap-2">
                <Checkbox
                  id="hide-columns"
                  checked={tableOptions?.hideColumns ?? false}
                  onCheckedChange={(checked) => setTableOptions({ ...tableOptions, hideColumns: !!checked })}
                />
                <label htmlFor="hide-columns">Ocultar columnas</label>
              </li>
            </ul>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-2">
                <Checkbox
                  id="column-search"
                  checked={tableOptions?.columnSearch ?? false}
                  onCheckedChange={(checked) => setTableOptions({ ...tableOptions, columnSearch: !!checked })}
                />
                <label htmlFor="column-search">Buscar en columnas</label>
              </li>
              <li className="flex items-center gap-2">
                <Checkbox
                  id="global-search"
                  checked={tableOptions?.globalSearch ?? false}
                  onCheckedChange={(checked) => setTableOptions({ ...tableOptions, globalSearch: !!checked })}
                />
                <label htmlFor="global-search">Buscar globalmente</label>
              </li>
            </ul>
          </div>
        </section>
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight">Personajes de los Simpsons</h2>
          <DataTable
            data={data}
            columns={columns}
            defaultSorting={[{ id: "Nombre", desc: false }]}
            options={tableOptions}
            storageKey="characters"
          />
        </section>
      </main>
    </div>
  );
}
