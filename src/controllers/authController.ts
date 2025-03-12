import { Request, RequestHandler, Response } from "express";
import { StaffSignupType, staffSignupSchema, staffLoginType, staffLoginSchema } from "../validator/staffschema";
import bcrypt from "bcryptjs";
import CreadentialsCheckPayload, { signJwtCredentialValidation, signJwtToken, verifyJwtToken } from "../utils/general";
import { generate2FACode, generateQrcodeURL, verify2FAToken } from "../utils/2FA";
import { User } from "../models/usermodel";

const TOKEN_DURATION = 60 * 60 * 24;

export const CredentialsValidation = async function (req: Request, res: Response) {
  const validationResult = staffSignupSchema.safeParse(req.body);
  if (!validationResult.success) {
    let errors = [] as any;
    const allErrors = validationResult.error.format() as any;
    delete allErrors._errors;
    Object.keys(allErrors).map((props: string | number) => {
      errors = errors.concat(allErrors[props]._errors);
      return props;
    });
    res.json({ success: false, error: errors });
    return;
  }

  const { email } = validationResult.data as StaffSignupType;
  const userexists = await User.findOne({ email });
  if (userexists) {
    res.json({ success: false, message: "A user exists with this Email " });
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
  console.log(req.body);
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
    res.json({ success: false, message: "A user exists with this Email " });
    return;
  }
  // password is being hashed on presave
  const newStaff = await User.create({ fullname, email, department, password, twoFactorSecret: secret });
  const { password: pass, twoFactorSecret, ...user } = newStaff.toObject();
  const token = signJwtToken({ email, role: user.role, _id: newStaff._id as string }, TOKEN_DURATION);
  res.json({
    success: true,
    message: "Registered successfully",
    user,
    token,
  });
  return;
};

export const LoginController = async function (req: Request, res: Response) {
  console.log(req.body);
  const validationResult = staffLoginSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.json({ success: false, errors: validationResult.error.format() });
    return;
  }
  const { email, password } = validationResult.data as staffLoginType;
  const user = await User.findOne({ email }, "+password");
  if (!user) {
    res.json({ success: false, message: "Incorrect email or password" });
    return;
  }

  if (!(await bcrypt.compare(password, user.password))) {
    res.json({ success: false, message: "Incorrect email or Password" });
    return;
  }

  res.json({
    success: true,
    user: { email, password },
  });

  return;
};
export const Login2FAController = async function (req: Request, res: Response) {
  const { data: userResponse, code } = req.body;
  const user = await User.findOne({ email: userResponse.email }, "+twoFactorSecret.secret");
  if (!verify2FAToken(user!.twoFactorSecret.secret, code)) {
    res.json({
      success: false,
      message: "incorrect code, please try again",
    });
    return;
  }
  const token = signJwtToken({ email: user!.email, role: user!.role, _id: user!._id as string }, TOKEN_DURATION);
  res.json({
    success: true,
    user,
    token,
  });
};
