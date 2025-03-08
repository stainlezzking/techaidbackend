import { Request, Response } from "express";
import { User } from "../models/usermodel";
import { AuthenticatedRequest } from "../@types/user";

export const getUserById = async function (req: AuthenticatedRequest, res: Response) {
  const user = await User.findById(req.user!._id);
  res.json({
    success: true,
    user,
  });
};

export const getUserByEmail = async function (req: Request, res: Response) {
  const user = await User.findById(req.body.email);
  res.json({
    success: true,
    user,
  });
};

export const editMySelf = async function (req: Request, res: Response) {
  const { password, twoFactorSecret, email, role, ...possibleUpdates } = req.body;
  await User.updateOne({ email: req.body.email }, possibleUpdates);
  res.json({
    success: true,
    message: "Profile updated successfully",
  });
  return;
};

/*
@admin
*/
export const changeUserPermission = async function (req: Request, res: Response) {
  // when a user is converted to support, add the user to the AutomatedSystem for selection
};
