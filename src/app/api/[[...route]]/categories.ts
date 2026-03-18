import { getAuth } from "@hono/clerk-auth";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "/db/drizzle";
import { categories, insertCategorySchema } from "/db/schema";
import { Hono } from "hono";
import { and, eq, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const app = new Hono()
  .get("/", async (c) => {
    const auth = getAuth(c);
    // Handle if user isnt signed in
    if (!auth?.userId) {
      // return response with an error code to ensure typesafety in client side
      return c.json({ error: "Unauthorized" }, 401);
    }
    const data = await db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(categories)
      .where(eq(categories.userId, auth.userId));

    return c.json({ data });
  })
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
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .where(and(eq(categories.userId, auth.userId), eq(categories.id, id)));

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    },
  )
  .post(
    "/",
    zValidator("json", insertCategorySchema.pick({ name: true })),
    async (c) => {
      // get auth details from Clerk
      const auth = getAuth(c);
      const values = c.req.valid("json");
      if (!auth?.userId) {
        // return response with an error code to ensure typesafety in client side
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(categories)
        .values({
          id: createId(),
          userId: auth.userId,
          ...values,
        })
        .returning();

      return c.json({ data });
    },
  )
  // api end point to bulk delete categories
  .post(
    "/bulk-delete",
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      }),
    ),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const data = await db
          .delete(categories) // delete when userId matches with logged in user and categories id with passed id
          .where(
            and(
              eq(categories.userId, auth.userId),
              inArray(categories.id, values.ids),
            ),
          )
          .returning({ id: categories.id });

        return c.json({ data });
      } catch (error) {
        return c.json({ error: "Failed to delete" }, 500);
      }
    },
  )
  // api end point to bulk delete categories
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
        const data = await db
          .delete(categories) // delete when userId matches with logged in user and categories id with passed id
          .where(and(eq(categories.userId, auth.userId), eq(categories.id, id)))
          .returning({ id: categories.id });

        return c.json({ data });
      } catch (error) {
        return c.json({ error: "Failed to delete" }, 500);
      }
    },
  )
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator("json", insertCategorySchema.pick({ name: true })),
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

      const [data] = await db
        .update(categories)
        .set(values)
        .where(and(eq(categories.userId, auth.userId), eq(categories.id, id)))
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    },
  );

export default app;
