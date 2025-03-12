import express, { NextFunction, Request, Response } from "express";
import {
  addNoteToTicket,
  assignTicket,
  createNewTicket,
  getAssignedTickets,
  getMyTickets,
  getTicketById,
  TicketFeedback,
  updateTicketStatus,
} from "../controllers/ticketsController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/general";

const router = express.Router();

router.post("/new", express.json(), authMiddleware, asyncHandler(createNewTicket));
router.post("/assignTicket", express.json(), authMiddleware, asyncHandler(assignTicket));
router.post("/feedback", express.json(), authMiddleware, asyncHandler(TicketFeedback));
router.post("/status", express.json(), authMiddleware, asyncHandler(updateTicketStatus));
router.get("/mytickets", express.json(), authMiddleware, asyncHandler(getMyTickets));
router.get("/assigned", express.json(), authMiddleware, asyncHandler(getAssignedTickets));
router.get("/:id", authMiddleware, asyncHandler(getTicketById));
router.put("/:id", express.json(), authMiddleware, asyncHandler(addNoteToTicket));

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.json({ success: false, message: err.message });
  return;
});
export default router;
