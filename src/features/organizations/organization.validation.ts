import {z} from "zod";

export const inviteSchema = z.object({
    body: z.object({
        email: z.string().nonempty("Email is required").email("must be a valid email"),
    })
});

export const updateRoleSchema = z.object({
    body: z.object({
        role: z.enum(["ADMIN", "MEMBER"]),
    })
});

export const updateOrgSchema = z.object({
    body: z.object({
        name : z.string().nonempty("Cannot be empty").min(3, "At least 3 characters required"),
    }),
    params: z.object({
        orgId: z.coerce.number({
            message: "Organization ID must be a number"
        }).int().positive("Organization ID must be a positive number"),
    })
})