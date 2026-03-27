import { getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { differenceInDays, parseISO, subDays } from "date-fns";
import { Hono } from "hono";
import z from "zod";
import { db } from "/db/drizzle";
import { and, desc, eq, gt, gte, lt, sql, sum } from "drizzle-orm";
import { accounts, categories, transactions } from "/db/schema";
import { calculatePercentageChange, fillMissingDays } from "@/lib/utils";

const app = new Hono().get(
  "/",
  zValidator(
    "query",
    z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      accountId: z.string().optional(),
    }),
  ),
  async (c) => {
    const auth = getAuth(c);
    const { from, to, accountId } = c.req.valid("query");

    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const defaultTo = new Date(
      new Date().toISOString().split("T")[0] + "T18:14:00Z",
    );
    const defaultFrom = new Date(
      new Date(defaultTo.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0] + "T00:00:00Z",
    );

    const startDate = from ? parseISO(from + "T00:00:00Z") : defaultFrom;
    const endDate = to ? parseISO(to + "T18:14:00Z") : defaultTo;

    const periodLength = differenceInDays(endDate, startDate) + 1;
    const lastPeriodStart = subDays(startDate, periodLength);
    const lastPeriodEnd = subDays(endDate, periodLength);

    async function fetchFinancialData(
      userId: string,
      startDate: Date,
      endDate: Date,
    ) {
      return await db
        .select({
          income:
            sql`SUM (CASE WHEN ${transactions.amount} > 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
              Number,
            ), // using mapWith to apply runtime transformation to convert it to number
          expense:
            sql`SUM (CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
              Number,
            ),
          remaining: sum(transactions.amount).mapWith(Number),
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, userId),
            gte(transactions.date, startDate),
            lt(transactions.date, endDate),
          ),
        );
    }

    const [currentPeriod] = await fetchFinancialData(
      auth.userId,
      startDate,
      endDate,
    );

    const [lastPeriod] = await fetchFinancialData(
      auth.userId,
      lastPeriodStart,
      lastPeriodEnd,
    );

    const incomeChange = calculatePercentageChange(
      currentPeriod.income,
      lastPeriod.income,
    );
    const expenseChange = calculatePercentageChange(
      currentPeriod.expense,
      lastPeriod.expense,
    );
    const remainingChange = calculatePercentageChange(
      currentPeriod.remaining,
      lastPeriod.remaining,
    );

    const expenseByCategory = await db
      .select({
        name: categories.name,
        value: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number),
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          accountId ? eq(transactions.accountId, accountId) : undefined,
          eq(accounts.userId, auth.userId),
          lt(transactions.amount, 0),
          gte(transactions.date, startDate),
          lt(transactions.date, endDate),
        ),
      )
      .groupBy(categories.name)
      .orderBy(desc(sql`SUM(ABS(${transactions.amount}))`));

    const topExpenseCategories = expenseByCategory.slice(0, 3);
    const otherExpenseCategories = expenseByCategory.slice(3);
    // return the sum of the categories beside top 3
    const otherExpenseSum = otherExpenseCategories.reduce(
      (sum, current) => sum + current.value,
      0,
    );

    const finalExpenseCategories = topExpenseCategories;
    // If more than 3 categories, add them to the list as aggretated value with name 'other'
    if (otherExpenseCategories.length > 0) {
      finalExpenseCategories.push({
        name: "Other",
        value: otherExpenseSum,
      });
    }

    const incomeByCategory = await db
      .select({
        name: categories.name,
        value: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number),
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          accountId ? eq(transactions.accountId, accountId) : undefined,
          eq(accounts.userId, auth.userId),
          gt(transactions.amount, 0),
          gte(transactions.date, startDate),
          lt(transactions.date, endDate),
        ),
      )
      .groupBy(categories.name)
      .orderBy(desc(sql`SUM(ABS(${transactions.amount}))`));

    const topIncomeCategories = incomeByCategory.slice(0, 3);
    const otherIncomeCategories = incomeByCategory.slice(3);
    // return the sum of the categories beside top 3
    const otherIncomeSum = otherIncomeCategories.reduce(
      (sum, current) => sum + current.value,
      0,
    );

    const finalIncomeCategories = topIncomeCategories;
    // If more than 3 categories, add them to the list as aggretated value with name 'other'
    if (otherIncomeCategories.length > 0) {
      finalIncomeCategories.push({
        name: "Other",
        value: otherIncomeSum,
      });
    }

    const activeDays = await db
      .select({
        date: sql<Date>`DATE(${transactions.date})`.as("Date"),
        income:
          sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
            Number,
          ),
        expense:
          sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`.mapWith(
            Number,
          ),
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(
        and(
          accountId ? eq(transactions.accountId, accountId) : undefined,
          eq(accounts.userId, auth.userId),
          gte(transactions.date, startDate),
          lt(transactions.date, endDate),
        ),
      )
      .groupBy(sql`DATE(${transactions.date})`)
      .orderBy(sql`DATE(${transactions.date})`);

    const filledDays = fillMissingDays(activeDays, startDate, endDate);

    const recentTransactions = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        name: transactions.name,
        date: transactions.date,
        dateBS: transactions.dateBS,
        categories: categories.name,
        account: accounts.name,
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          accountId ? eq(transactions.accountId, accountId) : undefined,
          eq(accounts.userId, auth.userId),
          gte(transactions.date, startDate),
          lt(transactions.date, endDate),
        ),
      )
      .orderBy(desc(transactions.date))
      .limit(10);

    return c.json({
      data: {
        remainingAmount: currentPeriod.remaining,
        remainingChange,
        incomeAmount: currentPeriod.income,
        incomeChange,
        expenseAmount: currentPeriod.expense,
        expenseChange,
        expenseCategory: finalExpenseCategories,
        incomeCategory: finalIncomeCategories,
        days: filledDays,
        recentTransactions,
      },
    });
  },
);

export default app;
