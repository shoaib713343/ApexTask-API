import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validate";
import { inviteSchema, updateOrgSchema, updateRoleSchema } from "./organization.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { deleteOrgController, getOrganizationController, inviteController, removeUserController, updateOrgController, updateRoleController } from "./organization.controller";
import boardRouter from "../boards/board.route";


const router = Router();

router.get("/:orgId", protect, asyncHandler(getOrganizationController));
router.delete(":/orgId", protect, asyncHandler(deleteOrgController));
router.delete("/:orgId/:userId", protect, asyncHandler(removeUserController));
router.patch("/:orgId/members/:userId", protect, validate(updateRoleSchema), asyncHandler(updateRoleController));
router.post("/:orgId/invite", protect, validate(inviteSchema), asyncHandler(inviteController));
router.patch("/:orgId", protect, validate(updateOrgSchema), asyncHandler(updateOrgController));

router.use("/:org/boards", boardRouter);
export default router;