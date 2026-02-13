import { getAuth } from "@hono/clerk-auth";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "/db/drizzle";
import { Hono } from "hono";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { parse, subDays } from "date-fns";

import {
  transactions,
  insertTransactionsSchema,
  accounts,
  categories,
} from "/db/schema";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        // date value 'from' and 'to' to display transactions
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      }),
    ),
    async (c) => {
      const auth = getAuth(c);
      const { from, to, accountId } = c.req.valid("query");

      // if no date is provided, use this default values
      const defaultTo = new Date(); // current date
      const defaultFrom = subDays(defaultTo, 30);

      // define the start and end date to show transactions
      const startDate = from
        ? parse(from, "yyyy-MM-dd", new Date())
        : defaultFrom;
      const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

      // Handle if user isnt signed in
      if (!auth?.userId) {
        // return response with an error code to ensure typesafety in client side
        return c.json({ error: "Unauthorized" }, 401);
      }
      const data = await db
        .select({
          id: transactions.id,
          payee: transactions.payee,
          amount: transactions.amount,
          location: transactions.location,
          date: transactions.date,
          categories: categories.name,
          categoryId: transactions.categoryId,
          account: accounts.name,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, auth.userId),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
          ),
        )
        .orderBy(desc(transactions.date));

      return c.json({ data });
    },
  )
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");

      // Handle if id is missing
      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      // Handle if user isnt signed in
      if (!auth?.userId) {
        // return response with an error code to ensure typesafety in client side
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .select({
          id: transactions.id,
          payee: transactions.payee,
          amount: transactions.amount,
          location: transactions.location,
          date: transactions.date,
          categoryId: transactions.categoryId,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)));

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    },
  )
  .post(
    "/bulk-create",
    zValidator("json", z.array(insertTransactionsSchema.omit({ id: true }))),
    async (c) => {
      // get auth details from Clerk
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        // return response with an error code to ensure typesafety in client side
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .insert(transactions)
        .values(
          values.map((value) => ({
            id: createId(),
            ...value,
          })),
        )
        .returning();

      return c.json({ data });
    },
  )
  .post(
    "/",
    zValidator("json", insertTransactionsSchema.omit({ id: true })),
    async (c) => {
      // get auth details from Clerk
      const auth = getAuth(c);
      const values = c.req.valid("json");
      if (!auth?.userId) {
        // return response with an error code to ensure typesafety in client side
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(transactions)
        .values({
          id: createId(),
          ...values,
        })
        .returning();

      return c.json({ data });
    },
  )
  // api end point to bulk delete transactions
  .post(
    "/bulk-delete",
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()), // array of account ids
      }),
    ),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        // a With clasue to select transactions that match with array of ids passed by user to delete
        const transactionsToDelete = db.$with("transaction_to_delete").as(
          db
            .select({ id: transactions.id })
            .from(transactions)
            .innerJoin(accounts, eq(transactions.accountId, accounts.id))
            .where(
              and(
                inArray(transactions.accountId, values.ids),
                eq(accounts.userId, auth.userId),
              ),
            ),
        );
        // now delete only the transactions that was selected above
        const data = await db
          .with(transactionsToDelete)
          .delete(transactions)
          .where(
            and(
              // the ids from the with clause matches with id in the table
              inArray(
                transactions.id,
                sql`(select id from ${transactionsToDelete})`,
              ),
            ),
          )
          .returning({ id: transactions.id });

        return c.json({ data });
      } catch (error) {
        return c.json({ error: "Failed to delete" }, 500);
      }
    },
  )
  // api end point to delete single transactions
  .delete(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      }),
    ),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        // a With clasue to select transactions that match with single id passed from param to delete
        const transactionToDelete = db.$with("transaction_to_delete").as(
          db
            .select({ id: transactions.id })
            .from(transactions)
            .innerJoin(accounts, eq(transactions.accountId, accounts.id))
            .where(
              and(
                eq(transactions.accountId, id),
                eq(accounts.userId, auth.userId),
              ),
            ),
        );
        const data = await db
          .with(transactionToDelete)
          .delete(transactions) // delete when userId matches with logged in user and transactions id with passed id
          .where(
            and(
              eq(transactions.id, sql`select id from ${transactionToDelete}`),
            ),
          )
          .returning({ id: transactions.id });

        return c.json({ data });
      } catch (error) {
        return c.json({ error: "Failed to delete" }, 500);
      }
    },
  )
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator("json", insertTransactionsSchema.omit({ id: true })),
    async (c) => {
      // get auth details from Clerk
      const auth = getAuth(c);
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      // Handle if id is missing
      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      if (!auth?.userId) {
        // return response with an error code to ensure typesafety in client side
        return c.json({ error: "Unauthorized" }, 401);
      }

      // a With clasue to select transaction that match with id passed from param to update
      const transactionToUpdate = db.$with("transaction_to_update").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(
              eq(transactions.accountId, id),
              eq(accounts.userId, auth.userId),
            ),
          ),
      );

      const [data] = await db
        .with(transactionToUpdate)
        .update(transactions)
        .set(values)
        .where(
          and(
            eq(transactions.id, sql`(select id from ${transactionToUpdate})`),
          ),
        )
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    },
  );

export default app;
