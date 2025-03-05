import express from "express";
import { createNewTicket } from "../controllers/ticketsController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/general";

const router = express.Router();

router.post("/new", express.json(), authMiddleware, asyncHandler(createNewTicket));

export default router;
