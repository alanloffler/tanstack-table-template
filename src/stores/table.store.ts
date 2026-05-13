import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ITableStore {
  columnOrder: Record<string, string[]>;
  setColumnOrder: (tableId: string, order: string[]) => void;
}

export const useTableStore = create<ITableStore>()(
  persist(
    (set) => ({
      columnOrder: {},
      setColumnOrder: (tableId, order) =>
        set((state) => ({
          columnOrder: { ...state.columnOrder, [tableId]: order },
        })),
    }),
    { name: "table-store" },
  ),
);
