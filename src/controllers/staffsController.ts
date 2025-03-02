import { Request, RequestHandler, Response } from "express";
import { StaffSignupInput, staffSignupSchema } from "../validator/staffschema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../config/db";

export const getStaffs = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "message received successfully" });
  return;
};

export const staffSignUpController = async (req: Request, res: Response) => {
  const validationResult = staffSignupSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ success: false, errors: validationResult.error.format() });
    return;
  }

  const { fullname, email, department, password } = validationResult.data as StaffSignupInput;

  try {
    const userexists = await User.findOne({ email });
    if (userexists) {
      res.status(409).json({ success: false, message: "A user exists with this Email " });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newStaff = await User.create({ fullname, email, department, password: hashedPassword });
    const { password: pass, ...user } = newStaff.toObject();
    const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: 60 * 3 });
    res.status(201).json({
      success: true,
      message: "Registered successfully",
      user,
      token,
    });
    return;
  } catch (err: any) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e: any) => e.message);
      res.status(400).json({ success: false, error: errors });
      return;
    }
    res.status(500).json({ success: false, message: "Server error", error: err });
    return;
  }
};
