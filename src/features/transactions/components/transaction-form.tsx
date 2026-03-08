import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { format, parse } from "date-fns";
import NepaliDate, { ADtoBS } from "nepali-date-library";
import { convertAmountToMilliunits } from "@/lib/utils";
import NepaliDatePicker from "@/components/nepali-date-picker";

const formSchema = z.object({
  date: z.coerce.date<Date>(),
  payee: z.string(),
  name: z.string(),
  amount: z.string(),
  accountId: z.string(),
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
  });

  // function to handle for submit
  const handleSubmit = (values: FormValues) => {
    const amount = parseFloat(values.amount); // string to float
    const amountInMilliunits = convertAmountToMilliunits(amount); // pass the float value

    // console.log({ values });

    onSubmit({
      ...values,
      amount: amountInMilliunits,
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
                    field.onChange(date);
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
                    // if (date instanceof NepaliDate) {
                    //   field.onChange(date.format("YYYY-MM-DD")); // format it in english (2082-11-12)
                    //   form.setValue("date", date.timestamp);
                    // } else {
                    //   field.onChange(date);
                    // }
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Name</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Name of the transaction or location"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="accountId"
          control={form.control}
          render={({ field }) => (
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
                />
              </FormControl>
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
                  value={field.value}
                  onChange={field.onChange}
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <AmountInput {...field} placeholder="0.00" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="payee"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payee</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Add a payee"
                  {...field}
                />
              </FormControl>
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
