import express, { NextFunction, Request, Response } from "express";
import { createNewTicket } from "../controllers/ticketsController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/general";

const router = express.Router();

router.post("/new", express.json(), authMiddleware, asyncHandler(createNewTicket));

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.json({ success: false, message: "An Error Occured on the server", error: err.message });
  return;
});
export default router;
