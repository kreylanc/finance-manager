import { getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { db } from "/db/drizzle";
import { accounts, insertAccountSchema } from "/db/schema";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
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
        id: accounts.id,
        name: accounts.name,
      })
      .from(accounts)
      .where(eq(accounts.userId, auth.userId));

    return c.json({ data });
  })
  .post(
    "/",
    zValidator("json", insertAccountSchema.pick({ name: true })),
    async (c) => {
      // get auth details from Clerk
      const auth = getAuth(c);
      const values = c.req.valid("json");
      if (!auth?.userId) {
        // return response with an error code to ensure typesafety in client side
        return c.json({ error: "Unauthorized" }, 401);
      }
      const [data] = await db
        .insert(accounts)
        .values({
          id: createId(),
          userId: auth.userId,
          ...values,
        })
        .returning();

      return c.json({ data });
    }
  );

export default app;
