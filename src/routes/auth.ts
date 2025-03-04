import express from "express";

import { CredentialsValidation, Login2FAController, LoginController, SignUpController } from "../controllers/authController";
const router = express.Router();

router.post("/credentials", express.json(), CredentialsValidation);
router.post("/register", express.json(), SignUpController);
router.post("/2FA/login_validation", express.json(), Login2FAController);
router.post("/login", express.json(), LoginController);

export default router;
