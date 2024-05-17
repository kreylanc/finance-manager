import { Hono } from "hono";
import { handle } from "hono/vercel";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";

export const runtime = "edge";

const app = new Hono().basePath("/api");

// Implementing authentication using clerk middleware
app.use("*", clerkMiddleware());

app.get("/hello", (c) => {
  return c.json({
    message: "Hello Next.js!",
  });
});

app.get(
  "/hello/:test",
  zValidator(
    "param",
    z.object({
      test: z.string(),
    })
  ),
  (c) => {
    const auth = getAuth(c);
    const { test } = c.req.valid("param");

    if (!auth?.userId) {
      return c.json({
        error: "You are not logged in.",
      });
    }
    return c.json({
      message: "Hello World",
      id: test,
    });
  }
);

export const GET = handle(app);
export const POST = handle(app);
