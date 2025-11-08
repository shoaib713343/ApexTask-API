import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validate";
import { createCardSchema, moveCardSchema } from "./card.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { createCardController, getCardByIdController, moveCardController } from "./card.controller";

const cardRouter = Router({ mergeParams: true });
export const topLevelCardRouter = Router();

cardRouter.post(
  "/",
  protect,
  validate(createCardSchema),
  asyncHandler(createCardController)
);

topLevelCardRouter.get("/:cardId", protect, asyncHandler(getCardByIdController));

topLevelCardRouter.patch(
  "/:cardId/move",
  protect,
  validate(moveCardSchema),
  asyncHandler(moveCardController)
);

export default cardRouter;
