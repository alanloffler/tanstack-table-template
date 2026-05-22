import type { ColumnSizingState } from "@tanstack/react-table";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TableState {
  columnOrder: string[];
  columnSizing: ColumnSizingState;
  columnVisibility: Record<string, boolean>;
}

interface ITableStore {
  clearTable: (storageKey: string) => void;
  setColumnOrder: (tableId: string, order: string[]) => void;
  setColumnSizing: (tableId: string, sizing: ColumnSizingState) => void;
  setColumnVisibility: (tableId: string, visibility: Record<string, boolean>) => void;
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
      setColumnSizing: (tableId, sizing) =>
        set((state) => ({
          tables: {
            ...state.tables,
            [tableId]: {
              ...state.tables[tableId],
              columnSizing: sizing,
            },
          },
        })),
      setColumnVisibility: (tableId, visibility) =>
        set((state) => ({
          tables: {
            ...state.tables,
            [tableId]: {
              ...state.tables[tableId],
              columnVisibility: visibility,
            },
          },
        })),
      tables: {},
    }),
    { name: "table-store" },
  ),
);
