import { DataTable } from "@/components/DataTable";
import { SortableHeader } from "@/components/SortableHeader";

import type { ColumnDef } from "@tanstack/react-table";

import { DataService, type ICharacter } from "@/services/data.service";

export default function App() {
  const data = DataService.get();

  const columns: ColumnDef<ICharacter>[] = [
    {
      accessorKey: "id",
      maxSize: 40,
      minSize: 40,
      header: ({ column }) => (
        <SortableHeader column={column}>ID</SortableHeader>
      ),
    },
    {
      accessorKey: "name",
      maxSize: 80,
      minSize: 80,
      header: ({ column }) => (
        <SortableHeader column={column}>Nombre</SortableHeader>
      ),
    },
    {
      accessorKey: "occupation",
      header: ({ column }) => (
        <SortableHeader column={column}>Ocupación</SortableHeader>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-6">
          <h1 className="text-lg font-semibold tracking-tight">
            Tanstack Table
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight">
            Personajes de los Simpsons
          </h2>
          <DataTable
            data={data}
            columns={columns}
            defaultSorting={[{ id: "name", desc: false }]}
          />
        </section>
      </main>
    </div>
  );
}
