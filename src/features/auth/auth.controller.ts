import { Request, Response } from "express";
import { loginUser, refreshToken, registerUser } from "./auth.service";
import { ApiResponse } from "../../utils/ApiResponse";
import cookieParser from "cookie-parser";

export async function registerController(req: Request, res: Response){
    const createdUser = await registerUser(req.body)
    res.status(201).json(
        new ApiResponse(
            201,
            "user registered successfully",
            createdUser
        )
    );

} 

export async function loginController(req: Request, res: Response) {
    const {user, accessToken, unHashedToken} = await loginUser(req.body);
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
    res.cookie("refreshToken", unHashedToken, options)
    return res.status(200).json(
        new ApiResponse(
            200,
            "User Logged in Succesfully",
            {
                user, accessToken
            },   
        )
    )
}

export function getMeController (req: Request, res: Response) {
return res.status(200).json(
    new ApiResponse(
        200,
        "User details fetched succesfully",
        req.user
    )
)
};

export async function refreshTokenController (req: Request, res: Response) {
    const {refreshToken} = req.cookies;
    const accessToken = await refreshToken(refreshToken);
    res.status(200).json(
        new ApiResponse(
            200,
            "token refreshed successfully",
            accessToken
        )
    )
}