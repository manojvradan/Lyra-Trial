// src/server/api/routers/table.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { faker } from "@faker-js/faker";

export const tableRouter = createTRPCRouter({
    create: protectedProcedure
    .input(z.object({ baseId: z.string(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Use a transaction to ensure all operations succeed or none do.
      return ctx.db.$transaction(async (prisma) => {
        // 1. Create the new table
        const newTable = await prisma.table.create({
          data: {
            name: input.name,
            baseId: input.baseId,
          },
        });
        // 2. Create a set of default columns for the new table
        await prisma.column.createMany({
          data: [
            { name: "Name", type: "TEXT", tableId: newTable.id, position: 0 },
            { name: "Notes", type: "TEXT", tableId: newTable.id, position: 1 },
            { name: "Status", type: "TEXT", tableId: newTable.id, position: 2 },
          ],
        });

        return newTable;
      });
    }),

    deleteColumn: protectedProcedure
    .input(z.object({ columnId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.column.delete({
        where: { id: input.columnId },
      });
    }),

    deleteRow: protectedProcedure
    .input(z.object({ rowId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.row.delete({
        where: { id: input.rowId },
      });
    }),
    
  // Procedure to get a table with all its columns, rows, and cells
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.table.findUnique({
        where: { id: input.id },
        include: {
          columns: { orderBy: { position: "asc" } },
          rows: {
            include: { cells: true },
            orderBy: { position: "asc" },
          },
        },
      });
    }),

  // Procedure to update a column's name
  updateColumnName: protectedProcedure
    .input(z.object({ columnId: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.column.update({
        where: { id: input.columnId },
        data: { name: input.name },
      });
    }),

  // Procedure to update a cell's value (creates the cell if it doesn't exist)
  updateCell: protectedProcedure
    .input(z.object({ rowId: z.string(), columnId: z.string(), value: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cell.upsert({
        where: {
          rowId_columnId: {
            rowId: input.rowId,
            columnId: input.columnId,
          },
        },
        create: {
          rowId: input.rowId,
          columnId: input.columnId,
          value: input.value,
        },
        update: {
          value: input.value,
        },
      });
    }),
    
  // Procedure to add a new column to a table
  addColumn: protectedProcedure
    .input(z.object({ tableId: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const maxPosition = await ctx.db.column.aggregate({
        where: { tableId: input.tableId },
        _max: { position: true },
      });
      return ctx.db.column.create({
        data: {
          tableId: input.tableId,
          name: input.name,
          type: "TEXT", // Default to TEXT type for now
          position: (maxPosition._max.position ?? -1) + 1,
        },
      });
    }),

  // Procedure to add a new row to a table
  addRow: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // We use a transaction to ensure both the row and its default cells are created
      return ctx.db.$transaction(async (prisma) => {
        const maxPosition = await prisma.row.aggregate({
          where: { tableId: input.tableId },
          _max: { position: true },
        });

        const newRow = await prisma.row.create({
          data: {
            tableId: input.tableId,
            position: (maxPosition._max.position ?? -1) + 1,
          },
        });

        // Create empty cells for the new row for all existing columns
        const columns = await prisma.column.findMany({ where: { tableId: input.tableId } });
        if (columns.length > 0) {
            await prisma.cell.createMany({
                data: columns.map(col => ({
                    rowId: newRow.id,
                    columnId: col.id,
                    value: faker.lorem.words(3), // Use fakerjs for default data
                })),
            });
        }
        return newRow;
      });
    }),
});