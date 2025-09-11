// src/server/api/routers/base.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const baseRouter = createTRPCRouter({
  /**
   * Fetches all bases owned by the currently logged-in user.
   * `protectedProcedure` ensures this can only be accessed by authenticated users.
   */
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.base.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc", // Show the newest bases first
      },
    });
  }),

  /**
   * Creates a new base for the currently logged-in user.
   * `protectedProcedure` handles authentication.
   * `.input()` uses Zod to validate that we receive a 'name' that is a non-empty string.
   */
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.base.create({
        data: {
          name: input.name,
          // Connect the new base to the user who is making the request
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(({ ctx, input }) => {
        return ctx.db.base.findUnique({
          where: { id: input.id, userId: ctx.session.user.id },
          include: {
          tables: true,
          },
      });
    }),
});