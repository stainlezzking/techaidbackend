import express, { NextFunction, Request, Response } from "express";

import { CredentialsValidation, Login2FAController, LoginController, SignUpController } from "../controllers/authController";
import { asyncHandler } from "../utils/general";
const router = express.Router();

router.post("/credentials", express.json(), asyncHandler(CredentialsValidation));
router.post("/register", express.json(), asyncHandler(SignUpController));
router.post("/2FA/login_validation", express.json(), asyncHandler(Login2FAController));
router.post("/login", express.json(), asyncHandler(LoginController));

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    res.json({ success: false, error: errors[0] });
    return;
  }
  console.log(err);
  res.json({ success: false, message: "An Error Occured on the server", error: err.message });
  return;
});
export default router;
