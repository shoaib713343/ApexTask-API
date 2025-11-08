import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validate";
import { createBoardSchema, updateBoardSchema } from "./board.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { createBoardController, getBoardsController, getBoardByIdController, updateBoardController, deleteBoardController} from "./board.controller";

const router = Router();

router.get("/:boardId", protect, asyncHandler(getBoardByIdController))
router.get("/", protect, asyncHandler(getBoardsController));
router.post("/", protect, validate(createBoardSchema), asyncHandler(createBoardController));
router.patch(
  "/:boardId",
  protect,
  validate(updateBoardSchema),
  asyncHandler(updateBoardController)
);
router.delete(
  "/:boardId",
  protect,
  asyncHandler(deleteBoardController
  )
);
import nestedListRouter from "../lists/list.routes"
router.use("/:boardId/lists", nestedListRouter);

export default router;