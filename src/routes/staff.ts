import express, { NextFunction, Request, Response } from "express";

// import { getStaffs, staffLoginController, staffSignUpController, UserCredentialsSignUpValidation } from "../controllers/staffsController";
// import { authMiddleware } from "../middleware/authMiddleware";
const router = express.Router();

// router.get("/", authMiddleware, getStaffs);
// router.post("/validate/credentials", express.json(), UserCredentialsSignUpValidation);
// router.post("/register", express.json(), staffSignUpController);
// router.post("/login", express.json(), staffLoginController);

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.json({ success: false, message: "An Error Occured on the server", error: err.message });
  return;
});
export default router;
