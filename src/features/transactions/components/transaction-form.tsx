import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/date-picker";
import Select from "@/components/select";
import { Input } from "@/components/ui/input";
import AmountInput from "@/components/amount-input";
import { Textarea } from "@/components/ui/textarea";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTransactionsSchema } from "/db/schema";
import { useForm } from "react-hook-form";
import { Trash } from "lucide-react";
import { format } from "date-fns";
import { ADtoBS } from "nepali-date-library";
import { convertAmountToMilliunits } from "@/lib/utils";
import NepaliDatePicker from "@/components/nepali-date-picker";

const formSchema = z.object({
  date: z.coerce.date<Date>(),
  name: z.string().min(3, "Transaction name must be at least 3 characters."),
  amount: z.string().min(1, "Enter an amount"),
  accountId: z.string().nonempty("Please select an account"),
  dateBS: z.string(),
  categoryId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const apiSchema = insertTransactionsSchema.omit({ id: true });

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = z.input<typeof apiSchema>;

type Props = {
  id?: string;
  defaultValues?: FormValues;
  onSubmit: (values: ApiFormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  categoryOptions: {
    label: string;
    value: string;
  }[];
  onCreateCategory: (name: string) => void;
  accountOptions: {
    label: string;
    value: string;
  }[];
  onCreateAccount: (name: string) => void;
};

export const TransactionForm = ({
  id,
  onSubmit,
  defaultValues,
  disabled,
  onDelete,
  categoryOptions,
  onCreateCategory,
  accountOptions,
  onCreateAccount,
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
    mode: "onChange",
  });

  // function to handle for submit
  const handleSubmit = (values: FormValues) => {
    const amount = parseFloat(values.amount); // string to float
    const amountInMilliunits = convertAmountToMilliunits(amount); // pass the float value

    onSubmit({
      ...values,
      amount: amountInMilliunits,
      categoryId: values.categoryId === "" ? null : values.categoryId,
    });
  };
  // function to handle delete transaction
  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          name="date"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date in AD </FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={(date) => {
                    // convert the date to utc normalized so in the database it will be stored as 00:00:00 as timezone and not push the date back by a day
                    const utcNormalized = date
                      ? new Date(format(date, "yyyy-MM-dd") + "T00:00:00.000Z")
                      : date;
                    field.onChange(utcNormalized);

                    // Convert and update BS date immediately
                    if (date) {
                      const dateAD = format(date, "yyyy-MM-dd");
                      const nepaliDate = ADtoBS(dateAD);

                      form.setValue("dateBS", nepaliDate);
                    }
                  }}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="dateBS"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date in BS </FormLabel>
              <FormControl>
                <NepaliDatePicker
                  value={field.value}
                  disabled={disabled}
                  onChange={(date) => {
                    field.onChange(date.format("YYYY-MM-DD")); // format it in english (2082-11-12)
                    form.setValue("date", date.timestamp);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Transaction Name</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Name of the transaction"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
              </FormControl>
              {fieldState.invalid && <FormMessage />}
            </FormItem>
          )}
        />
        <FormField
          name="accountId"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <FormControl>
                <Select
                  placeholder="Select an account"
                  options={accountOptions}
                  onCreate={onCreateAccount}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                  aria-state={fieldState.invalid}
                />
              </FormControl>
              {fieldState.invalid && <FormMessage />}
            </FormItem>
          )}
        />
        <FormField
          name="categoryId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select
                  placeholder="Select a category"
                  options={categoryOptions}
                  onCreate={onCreateCategory}
                  value={field.value || null}
                  onChange={(value) => {
                    field.onChange(value || "");
                  }}
                  disabled={disabled}
                  clearable={true}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="amount"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <AmountInput
                  {...field}
                  onChange={(value) => {
                    field.onChange(value || "");
                  }}
                  placeholder="0.00"
                  aria-state={fieldState.invalid}
                />
              </FormControl>
              {fieldState.invalid && <FormMessage />}
            </FormItem>
          )}
        />

        <FormField
          name="notes"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional notes"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={disabled}>
          {id ? "Save Changes" : "Create transaction"}
        </Button>
        {!!id && (
          <Button
            type="button" // to not act as a submit button for the form
            variant="outline"
            className="w-full"
            disabled={disabled}
            onClick={handleDelete}
          >
            <Trash />
            Delete transaction
          </Button>
        )}
      </form>
    </Form>
  );
};
