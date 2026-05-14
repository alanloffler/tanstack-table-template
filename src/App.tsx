import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/DataTable";
import { SortableIcon } from "@/components/SortableIcon";

import type { ColumnDef } from "@tanstack/react-table";

import { DataService, type ICharacter } from "@/services/data.service";

export default function App() {
  const data = DataService.get();

  const columns: ColumnDef<ICharacter>[] = [
    {
      id: "select-col",
      size: 20,
      enableColumnFilter: false,
      meta: {
        disableExport: true,
        disableDragging: true,
      },
      header: ({ table }) => (
        <Checkbox
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
      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight">Personajes de los Simpsons</h2>
          <DataTable
            data={data}
            columns={columns}
            defaultSorting={[{ id: "name", desc: false }]}
            storageKey="characters"
          />
        </section>
      </main>
    </div>
  );
}
