import { Request, RequestHandler, Response } from "express";
import { StaffSignupType, staffSignupSchema, staffLoginType, staffLoginSchema } from "../validator/staffschema";
import bcrypt from "bcryptjs";
import { User } from "../config/db";
import CreadentialsCheckPayload, { signJwtCredentialValidation, signJwtToken, verifyJwtToken } from "../utils/general";
import { generate2FACode, generateQrcodeURL, verify2FAToken } from "../utils/2FA";

const TOKEN_DURATION = 60 * 3;

export const CredentialsValidation = async function (req: Request, res: Response) {
  const validationResult = staffSignupSchema.safeParse(req.body);
  if (!validationResult.success) {
    console.log(validationResult.error);
    res.status(400).json({ success: false, errors: validationResult.error.format() });
    return;
  }

  const { fullname, email, department, password } = validationResult.data as StaffSignupType;
  try {
    const userexists = await User.findOne({ email });
    if (userexists) {
      res.status(409).json({ success: false, message: "A user exists with this Email " });
      return;
    }

    const { secret, encoding } = generate2FACode();
    const userTokenHash = signJwtCredentialValidation({ ...validationResult.data, secret: { secret, encoding } }, 60 * 10);
    res.json({
      success: true,
      data: userTokenHash,
      qrcodeURL: await generateQrcodeURL(secret),
    });
    return;
  } catch (err: any) {
    console.log(err.message);
    res.status(500).json({ success: false, message: "An Error Occured on the server", error: err });
    return;
  }
};

export const SignUpController = async (req: Request, res: Response) => {
  const { data: hash, code } = req.body;
  if (!req.body.data || !verifyJwtToken(hash)) {
    res.json({
      success: false,
      message: "Please this session has timed out, reload and try again.",
      redirect: true,
    });
    return;
  }
  const token = verifyJwtToken(hash) as CreadentialsCheckPayload;
  console.log(code);
  if (!verify2FAToken(token.secret.secret, code)) {
    res.json({
      success: false,
      message: "incorrect code, please try again",
    });
    return;
  }
  const { fullname, email, department, password, secret } = token;

  try {
    const userexists = await User.findOne({ email });
    if (userexists) {
      res.status(409).json({ success: false, message: "A user exists with this Email " });
      return;
    }
    // password is being hashed on presave
    const newStaff = await User.create({ fullname, email, department, password, twoFactorSecret: secret });
    const { password: pass, ...user } = newStaff.toObject();
    const token = signJwtToken({ email, role: user.role }, TOKEN_DURATION);
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
    console.log(err);
    res.status(500).json({ success: false, message: "An Error Occured on the server", error: err });
    return;
  }
};

export const LoginController = async function (req: Request, res: Response) {
  const validationResult = staffLoginSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ success: false, errors: validationResult.error.format() });
    return;
  }
  const { email, password } = validationResult.data as staffLoginType;

  try {
    const user = await User.findOne({ email }, "+password");
    if (!user) {
      res.status(409).json({ success: false, message: "Incorrect Username or password" });
      return;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ success: false, message: "Incorrect Username or Password" });
      return;
    }

    res.status(200).json({
      success: true,
      user: { email, password },
    });

    return;
  } catch (err: any) {
    res.status(500).json({ success: false, message: "An Error Occured on the server", error: err });
    return;
  }
};
export const Login2FAController = async function (req: Request, res: Response) {
  const { user: userResponse, code } = req.body;
  const user = await User.findOne({ email: userResponse.email }, "+twoFactorSecret.secret");
  if (!verify2FAToken(user!.twoFactorSecret.secret, code)) {
    res.json({
      success: false,
      message: "incorrect code, please try again",
    });
    return;
  }
  const token = signJwtToken({ email: user!.email, role: user!.role }, TOKEN_DURATION);
  res.status(200).json({
    success: true,
    user,
    token,
  });
};
