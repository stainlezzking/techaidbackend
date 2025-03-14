import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    role: string;
    _id: string;
  };
}
