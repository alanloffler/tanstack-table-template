import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TableState {
  columnOrder: string[];
}

interface ITableStore {
  clearTable: (storageKey: string) => void;
  setColumnOrder: (tableId: string, order: string[]) => void;
  tables: Record<string, TableState>;
}

export const useTableStore = create<ITableStore>()(
  persist(
    (set) => ({
      clearTable: (storageKey: string) =>
        set((state) => {
          const tables = { ...state.tables };
          delete tables[storageKey];
          return { tables };
        }),
      setColumnOrder: (tableId, order) =>
        set((state) => ({
          tables: {
            ...state.tables,
            [tableId]: {
              ...state.tables[tableId],
              columnOrder: order,
            },
          },
        })),
      tables: {},
    }),
    { name: "table-store" },
  ),
);
