import {z} from "zod";

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(3, "name must containe at least 3 characters"),
        email: z.string().email("must be a valid email"),
        password: z.string().
            min(8, "Password must be atleast 8 charactrs long")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),
        passwordConfirmation: z.string(),
    })
    .refine(
        (data)=> data.password === data.passwordConfirmation,
        {
            message: "Passwords donot match",
            path: ["passwordConfirmation"],
        }
    ),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().nonempty("email cant be empty").email("must be a valid email"),
        password: z.string().nonempty("password cant be empty")
    })
});

export const refreshSchema = z.object({
    cookies: z.object({
        refreshToken: z.string().nonempty("Refresh Token is Required"),
    }),
});