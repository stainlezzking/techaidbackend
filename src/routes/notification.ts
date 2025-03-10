import express, { NextFunction, Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/general";
import { getMyNotificatoins } from "../controllers/notificationController";
const router = express.Router();

router.get("/mynotifications", authMiddleware, asyncHandler(getMyNotificatoins));

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.json({ success: false, message: err.message });
  return;
});

export default router;
