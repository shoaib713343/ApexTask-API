import { Router } from "express";
import { validate } from "../../middleware/validate";
import { loginSchema, refreshSchema, registerSchema } from "./auth.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { getMeController, loginController, refreshTokenController, registerController } from "./auth.controller";
import { protect } from "../../middleware/authMiddleware";

const router = Router();

router.post(
    "/register",
    validate(registerSchema),
    asyncHandler(registerController)
)

router.post(
    "/login",
    validate(loginSchema),
    asyncHandler(loginController)
)

router.get(

    "/me",
    protect,
    getMeController
)

router.post(
    "/refresh",
    validate(refreshSchema),
    asyncHandler(refreshTokenController)
);

export default router;

