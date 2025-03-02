import { Request, RequestHandler, Response } from "express";
import { StaffSignupInput, staffSignupSchema } from "../validator/staffschema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getStaffs = (req: Request, res: Response) => {
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
    /*
        ##note
        Remember to check if user exists and create a new user
        */

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = {
      fullname,
      email,
      department,
      password: hashedPassword,
    };

    const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: 60 * 3 });
    res.status(201).json({
      success: true,
      message: "Registered successfully",
      user: { fullname, email, department, token },
    });
    return;
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
    return;
  }
};
