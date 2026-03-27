import { type Table } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { jsonToCSV } from "react-papaparse";
import * as XLSX from "xlsx";
import { format } from "date-fns";

export function ExportDropdown<TData>({ table }: { table: Table<TData> }) {
  // get all the rows or filtered ones
  const rows = table.getFilteredRowModel().rows;
  // get all the visible columns
  const columns = table.getVisibleLeafColumns();
  const filteredColumns = columns.slice(1, columns.length - 1);

  const exportToCSV = () => {
    const headers = filteredColumns.map((col) => col.id);

    const csvRows = rows.map((row) => {
      return filteredColumns.map((col) => {
        const cellValue = row.getValue(col.id);
        return cellValue;
      });
    });

    const csv = jsonToCSV({
      fields: headers,
      data: csvRows,
    });
    // Create a Blob with the CSV data and specify the MIME type
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary link element to trigger the download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "data.csv"); // Set the download file name
    link.click(); // Simulate a click to start the download

    // Clean up the object URL
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const data = rows.map((row) => {
      const rowData: any = {};
      filteredColumns.forEach((col) => {
        const header = col.id;
        rowData[header] = row.getValue(col.id);
      });
      return rowData;
    });

    const dateFormattedData = data.map((item) => {
      if (item.date) {
        const formattedDate = format(item.date, "yyyy-MM-dd HH:mm:ss");
        return {
          ...item,
          date: formattedDate,
        };
      } else {
        return item;
      }
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(dateFormattedData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Download
    XLSX.writeFile(workbook, "data.xlsx");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" className="w-full h-8">
          <Download />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="mr-1.5" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="mr-1.5" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
