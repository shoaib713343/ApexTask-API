import {z} from  "zod";
import { boardService } from "../boards/board.service";

export const createListSchema = z.object({
    body: z.object({
        title: z.string().nonempty("Title can't be empty").min(3, "Title must contain atleast 3 characters")
    }),
    params: z.object({
        boardId: z.coerce.number({
            message: "The boardId in path must be a number",
        }).int().positive("boardId must be a positive number"),
    })
});

export const updateListSchema = z.object({
  body: z.object({
    title: z
      .string()
      .nonempty("Title can't be empty")
      .min(3, "Title must contain at least 3 characters"),
  }),
  params: z.object({
    listId: z.coerce
      .number({
        message: "List ID must be a number",
      })
      .int()
      .positive("List ID must be a positive number"),
  }),
});

export const deleteListSchema = z.object({
    params: z.object({
        listId: z.coerce.number({
            message: "List ID must be a number"
        }).int().positive("List ID must be a positive number"),
    }),
});

export const reorderListSchema = z.object({
    params: z.object({
    boardId: z.coerce
      .number({
        message: "Board ID must be a number",
      })
      .int()
      .positive("Board ID must be a positive number"),
  }),
 body: z.object({
    orderedListIds: z
      .array(z.number(), { 
        message: "orderedListIds must be an array of numbers",
      })
      .nonempty("Cannot submit an empty list"), 

})
});