import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validate";
import cardRouter from '../cards/card.routes';
import {
  createListSchema,
  deleteListSchema,
  reorderListSchema,
  updateListSchema,
} from "./list.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createListController,
  deleteListController,
  getListsController,
  reorderListsController,
  updateListController,
} from "./list.controller";

const router = Router({ mergeParams: true });
export const topLevelListRouter = Router();

router.get("/", protect, asyncHandler(getListsController));
router.post(
  "/",
  protect,
  validate(createListSchema),
  asyncHandler(createListController)
);
topLevelListRouter.patch(
  "/:listId",
  protect,
  validate(updateListSchema),
  asyncHandler(updateListController)
);
topLevelListRouter.delete(
  "/:listId",
  protect,
  validate(deleteListSchema),
  asyncHandler(deleteListController)
);
router.patch(
  "/reorder",
  protect,
  validate(reorderListSchema),
  asyncHandler(reorderListsController)
);

router.use("/:listId/cards", cardRouter);
export default router;
