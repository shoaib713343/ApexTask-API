import {z} from "zod";

export const createBoardSchema = z.object({
    body: z.object({
        name: z.string().nonempty("Board's name is mandatory").min(3, "Atleast 3 characters required"),
    }),
    params: z.object({
        orgId: z.coerce.number({
            message: "Organization ID must be number"
        }).int().positive("Organization ID must be a positive number"),
    }),
});

export const updateBoardSchema = z.object({
    body: z.object({
        name: z.string().nonempty("Board's name is mandatory").min(3, "Atleast 3 characters required"),
    }),
    params: z.object({
        boardId: z.coerce.number({
            message: "Board ID must be a number"
        }).int().positive("Board ID must be a positive number")
    })
})