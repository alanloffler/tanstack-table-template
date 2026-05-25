import { Github } from "@/components/icons/Github";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, type ITableOptions } from "@/components/DataTable";
import { SortableIcon } from "@/components/SortableIcon";

import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";

import { DataService, type ICharacter } from "@/services/data.service";
import { useTheme } from "@/providers/theme.context";

const INIT_OPTS: ITableOptions = {
  columnSearch: true,
  columnSizing: true,
  dragAndDrop: true,
  exportPdf: true,
  exportXls: true,
  globalSearch: true,
  hideColumns: true,
  showTooltips: true,
};

export default function App() {
  const [data, setData] = useState<ICharacter[]>([]);
  const [delay, setDelay] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableOptions, setTableOptions] = useState<ITableOptions>(INIT_OPTS);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (delay > 0) setLoading(true);
        const data = await DataService.get(delay);
        setData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [delay]);

  const columns: ColumnDef<ICharacter>[] = [
    {
      accessorKey: "select-col",
      id: "Seleccionar",
      size: 20,
      enableColumnFilter: false,
      meta: {
        alignment: "center",
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
      size: 20,
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
      accessorKey: "gender",
      id: "Género",
      size: 40,
      enableColumnFilter: false,
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span>{column.id}</span>
        </div>
      ),
    },
    {
      accessorKey: "age",
      id: "Edad",
      size: 40,
      enableColumnFilter: false,
      header: ({ column }) => (
        <div className="flex items-center gap-1">
          <span>{column.id}</span>
          <SortableIcon column={column} />
        </div>
      ),
      cell: ({ row }) => <span>{row.original.age ?? "-"}</span>,
    },
    {
      accessorKey: "occupation",
      id: "Ocupación",
      minSize: 200,
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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold tracking-tight">Tanstack Table</h1>
            <span className="text-muted-foreground text-sm tracking-tight">React version</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() =>
                window.open("https://github.com/alanloffler/tanstack-table-template", "_blank", "noopener,noreferrer")
              }
              size="icon-sm"
              variant="outline"
            >
              <Github className="stroke-neutral-500" strokeWidth={1.5} />
            </Button>
            <Button
              onClick={(e) => {
                document.documentElement.style.setProperty("--x", `${e.clientX}px`);
                document.documentElement.style.setProperty("--y", `${e.clientY}px`);
                document.startViewTransition(() => setTheme(theme === "dark" ? "light" : "dark"));
              }}
              size="icon-sm"
              variant="outline"
            >
              {theme === "dark" ? (
                <Sun className="stroke-yellow-400" strokeWidth={1.5} />
              ) : (
                <Moon className="fill-neutral-200 stroke-neutral-400" strokeWidth={1.5} />
              )}
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-8">
        <Card className="flex flex-col gap-3">
          <CardHeader>
            <CardTitle>Opciones de la tabla</CardTitle>
          </CardHeader>
          <CardContent>
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
                <li className="flex items-center gap-2">
                  <Checkbox
                    id="resize-columns"
                    checked={tableOptions?.columnSizing ?? false}
                    onCheckedChange={(checked) => setTableOptions({ ...tableOptions, columnSizing: !!checked })}
                  />
                  <label htmlFor="resize-columns">Redimensionar columnas</label>
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
              <ul className="flex flex-col gap-3">
                <li className="flex items-center gap-2">
                  <Checkbox
                    id="simulate-async"
                    checked={delay !== 0}
                    onCheckedChange={(checked) => setDelay(checked ? 4000 : 0)}
                  />
                  <label htmlFor="simulate-async">Simular conexión lenta</label>
                </li>
                <li className="flex items-center gap-2">
                  <Checkbox
                    id="show-tooltips"
                    checked={tableOptions?.showTooltips ?? false}
                    onCheckedChange={(checked) => setTableOptions({ ...tableOptions, showTooltips: !!checked })}
                  />
                  <label htmlFor="show-tooltips">Mostrar tooltips</label>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Personajes de los Simpsons</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={data}
              columns={columns}
              defaultSorting={[{ id: "Nombre", desc: false }]}
              loading={loading}
              options={tableOptions}
              storageKey="characters-01"
            />
          </CardContent>
        </Card>
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight">Personajes de los Simpsons</h2>
          <DataTable
            data={data}
            columns={columns}
            defaultSorting={[{ id: "Nombre", desc: false }]}
            loading={loading}
            options={tableOptions}
            storageKey="characters-02"
          />
        </section>
      </main>
    </div>
  );
}
