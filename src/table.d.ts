import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta {
    alignment?: "left" | "center" | "right";
    disableDragging?: boolean;
    disableExport?: boolean;
  }
}
