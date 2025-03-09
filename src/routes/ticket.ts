import express, { NextFunction, Request, Response } from "express";
import { createNewTicket, getMyTickets } from "../controllers/ticketsController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/general";

const router = express.Router();

router.post("/new", express.json(), authMiddleware, asyncHandler(createNewTicket));
router.get("/mytickets", express.json(), authMiddleware, asyncHandler(getMyTickets));

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.json({ success: false, message: err.message });
  return;
});
export default router;
