import { z } from "zod";

export const createCardSchema = z.object({
  params: z.object({
    listId: z.coerce
      .number({
        message: "List ID must be a number",
      })
      .int()
      .positive("List ID must be a positive number"),
  }),
  body: z.object({
    title: z.string().nonempty("Card title is mandatory"),
    description: z.string().optional(),
  }),
});

export const moveCardSchema = z.object({
    params: z.object({
        cardId: z.coerce.number({
            message: "card Id must be a number",
    }).int().positive(),
    }),
    body: z.object({
        newListId: z.number().int().positive("New list ID must be positive"),
    newRank: z.number().int().min(0, "Rank cannot be negative"),
    })
})