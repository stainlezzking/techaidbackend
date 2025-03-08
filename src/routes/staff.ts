import express, { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/general";
import { getUserById } from "../controllers/staffsController";
import { authMiddleware } from "../middleware/authMiddleware";

// import { getStaffs, staffLoginController, staffSignUpController, UserCredentialsSignUpValidation } from "../controllers/staffsController";
// import { authMiddleware } from "../middleware/authMiddleware";
const router = express.Router();

// router.get("/", authMiddleware, getStaffs);
// router.post("/validate/credentials", express.json(), UserCredentialsSignUpValidation);
// router.post("/register", express.json(), staffSignUpController);
// router.post("/login", express.json(), staffLoginController);
router.get("/profile", authMiddleware, asyncHandler(getUserById));

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.json({ success: false, message: err.message });
  return;
});
export default router;
