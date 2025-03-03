import express from "express";

import { getStaffs, staffLoginController, staffSignUpController, UserCredentialsSignUpValidation } from "../controllers/staffsController";
import { authMiddleware } from "../middleware/authMiddleware";
const router = express.Router();

router.get("/", authMiddleware, getStaffs);
router.post("/validate/credentials", express.json(), UserCredentialsSignUpValidation);
router.post("/register", express.json(), staffSignUpController);
router.post("/login", express.json(), staffLoginController);

export default router;
