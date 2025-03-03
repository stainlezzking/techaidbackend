import jwt from "jsonwebtoken";

export default interface CreadentialsCheckpayload extends StaffSignupType {
  secret: {
    secret: string;
    encoding: string;
  };
}
import { StaffSignupType } from "../validator/staffschema";
export const signJwtToken = function (payload: { email: string; role: string }, exp: number) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: exp });
};

export const signJwtCredentialValidation = function (payload: CreadentialsCheckpayload, exp: number) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: exp });
};

export const verifyJwtToken = function (token: string) {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    return decoded;
  } catch (error) {
    return false;
  }
};
