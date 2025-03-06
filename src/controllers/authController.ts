import { Request, RequestHandler, Response } from "express";
import { StaffSignupType, staffSignupSchema, staffLoginType, staffLoginSchema } from "../validator/staffschema";
import bcrypt from "bcryptjs";
import CreadentialsCheckPayload, { signJwtCredentialValidation, signJwtToken, verifyJwtToken } from "../utils/general";
import { generate2FACode, generateQrcodeURL, verify2FAToken } from "../utils/2FA";
import { User } from "../models/usermodel";

const TOKEN_DURATION = 60 * 20;

export const CredentialsValidation = async function (req: Request, res: Response) {
  const validationResult = staffSignupSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ success: false, errors: validationResult.error.format() });
    return;
  }

  const { email } = validationResult.data as StaffSignupType;
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
  const Responsetoken = verifyJwtToken(hash) as CreadentialsCheckPayload;

  if (!verify2FAToken(Responsetoken.secret.secret, code)) {
    res.json({
      success: false,
      message: "incorrect code, please try again",
    });
    return;
  }
  const { fullname, email, department, password, secret } = Responsetoken;

  const userexists = await User.findOne({ email });
  if (userexists) {
    res.status(409).json({ success: false, message: "A user exists with this Email " });
    return;
  }
  // password is being hashed on presave
  const newStaff = await User.create({ fullname, email, department, password, twoFactorSecret: secret });
  const { password: pass, ...user } = newStaff.toObject();
  const token = signJwtToken({ email, role: user.role, _id: newStaff._id as string }, TOKEN_DURATION);
  res.status(201).json({
    success: true,
    message: "Registered successfully",
    user,
    token,
  });
  return;
};

export const LoginController = async function (req: Request, res: Response) {
  const validationResult = staffLoginSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ success: false, errors: validationResult.error.format() });
    return;
  }
  const { email, password } = validationResult.data as staffLoginType;
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
  const token = signJwtToken({ email: user!.email, role: user!.role, _id: user!._id as string }, TOKEN_DURATION);
  res.status(200).json({
    success: true,
    user,
    token,
  });
};
