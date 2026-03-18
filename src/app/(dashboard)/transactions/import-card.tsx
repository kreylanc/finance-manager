import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { ImportTable } from "./import-table";
import { convertAmountToMilliunits } from "@/lib/utils";
import { ADtoBS, BStoAD } from "nepali-date-library";
import { format, parse } from "date-fns";
import { toast } from "sonner";

const dateFormat = "yyyy-MM-dd HH:mm:ss";
const outputFormat = "yyyy-MM-dd";

const requiredOptions = ["amount", "date", "name"];

interface SelectedColumnState {
  [key: string]: string | null;
}

type Props = {
  data: string[][];
  onCancel: () => void;
  onSubmit: (data: any) => void;
};

export const ImportCard = ({ data, onCancel, onSubmit }: Props) => {
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumnState>(
    {},
  );

  const headers = data[0];
  const body = data.slice(1);

  const onTableHeadSelectChange = (
    columnIndex: number,
    value: string | null,
  ) => {
    setSelectedColumns((prev) => {
      // spread the previous state to newSelectedColumns
      const newSelectedColumns = { ...prev };

      for (const key in newSelectedColumns) {
        if (newSelectedColumns[key] === value) {
          newSelectedColumns[key] = null;
        }
      }

      if (value === "skip") {
        value = null;
      }

      newSelectedColumns[`column_${columnIndex}`] = value;

      return newSelectedColumns;
    });
  };

  const progress = Object.values(selectedColumns).filter(Boolean).length;

  const handleContinue = () => {
    const getColumnIndex = (column: string) => {
      // The column key is in the format of "column_{indexNo.}", so we split the string by "_" and return the second part which is the index number
      return column.split("_")[1];
    };
    // function to convert date from AD to BS and format it to "yyyy-MM-dd"
    const convertDateToBS = (dateString: string) => {
      const dateSplit = dateString.split(" ")[0];
      return ADtoBS(dateSplit);
    };

    const convertDateToAD = (dateString: string) => {
      const dateAD = BStoAD(dateString);
      return format(parse(dateAD, outputFormat, new Date()), outputFormat);
    };

    // map the CSV data to match the format of our schema
    const mappedData = {
      headers: headers.map((_, index) => {
        // if a column is selected return its header value else return null
        return selectedColumns[`column_${index}`] || null;
      }),
      body: body
        .map((row) => {
          const transformedRow = row.map((cell, index) => {
            // if a column is selected then return the row value of that column, else return null
            return selectedColumns[`column_${index}`] ? cell : null;
          });

          return transformedRow.every((item) => item === null)
            ? []
            : transformedRow;
        })
        .filter((row) => row.length > 0), // filter out the empty rows which means all their values are null
    };

    const arrayOfData = mappedData.body.map((row) => {
      return row.reduce((acc: any, cell, index) => {
        const header = mappedData.headers[index];
        if (header != null) {
          acc[header] = cell;
        }

        return acc;
      }, {});
    });

    // check if the user select the date field
    if (arrayOfData.find((item) => item.date)) {
      try {
        const formattedData = arrayOfData.map((item) => ({
          ...item,
          amount: convertAmountToMilliunits(parseFloat(item.amount)),
          date: format(parse(item.date, dateFormat, new Date()), outputFormat),
          dateBS: convertDateToBS(item.date),
        }));

        onSubmit(formattedData);
      } catch (error) {
        toast.error("An error occured. Please try again with valid data.");
      }
    } else if (arrayOfData.find((item) => item.dateBS)) {
      try {
        const formattedData = arrayOfData.map((item) => ({
          ...item,
          amount: convertAmountToMilliunits(parseFloat(item.amount)),
          date: convertDateToAD(item.dateBS),
        }));
        onSubmit(formattedData);
      } catch {
        toast.error("An error occured. Please try again with valid data.");
      }
    }
  };

  return (
    <div className="max-w-screen-2xl w-full mx-auto -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="flex gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Import Transaction
          </CardTitle>

          <div className="flex flex-col md:flex-row items-center gap-2">
            <Button onClick={onCancel} size="sm" className="w-full">
              Cancel
            </Button>
            <Button
              className="w-full"
              size="sm"
              disabled={progress < requiredOptions.length}
              onClick={handleContinue}
            >
              Continue {progress}/{requiredOptions.length}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ImportTable
            body={body}
            headers={headers}
            selectedColumns={selectedColumns}
            onTableHeadSelectChange={onTableHeadSelectChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};
