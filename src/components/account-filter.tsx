"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import queryString from "query-string";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useGetSummary } from "@/features/summary/api/use-get-summary";

export const AccountFilter = () => {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const accountId = params.get("accountId") || "all";
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const { data: accounts, isLoading: isLoadingAccounts } = useGetAccounts();
  const { isLoading: isLoadingSummary } = useGetSummary();

  const onAccountChange = (value: string) => {
    const query = {
      accountId: value,
      from,
      to,
    };

    if (value === "all") {
      query.accountId = "";
    }

    const url = queryString.stringifyUrl(
      {
        url: pathname,
        query,
      },
      { skipNull: true, skipEmptyString: true },
    );

    router.push(url);
  };
  return (
    <Select
      value={accountId}
      onValueChange={onAccountChange}
      disabled={isLoadingAccounts || isLoadingSummary}
    >
      <SelectTrigger className="w-full  rounded-md px-3 h-9 font-normal bg-white/10 outline-none text-primary-foreground border-none hover:bg-white/20 hover:text-primary-foreground lg:max-w-48 focus:ring-offset-blue-500 transition ">
        <SelectValue placeholder="Select account" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All accounts</SelectItem>
        {accounts?.map((account) => (
          <SelectItem value={account.id} key={account.id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
