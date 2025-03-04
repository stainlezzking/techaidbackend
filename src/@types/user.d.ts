import { Request } from "express";

// this property are added in the authMiddleware
declare module "express-serve-static-core" {
  interface Request {
    user?: {
      email: string;
      role: string;
      _id: string;
    };
  }
}
