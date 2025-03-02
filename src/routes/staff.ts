import express from "express";

import { getStaffs, staffSignUpController } from "../controllers/staffsController";
import { authMiddleware } from "../middleware/authMiddleware";
const router = express.Router();

router.get("/", authMiddleware, getStaffs);
router.post("/register", express.json(), staffSignUpController);

export default router;
