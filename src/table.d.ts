import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta {
    disableDragging?: boolean;
    disableExport?: boolean;
  }
}
