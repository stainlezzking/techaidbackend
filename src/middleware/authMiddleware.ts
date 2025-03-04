import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { verifyJwtToken } from "../utils/general";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization);
  if (!token) {
    res.status(401).json({ success: false, message: "Unauthorized", unauthorized: true });
    return;
  }

  if (!verifyJwtToken(token)) {
    res.status(403).json({ success: false, message: "Invalid or Expired token", unauthorized: true });
    return;
  }
  const decoded = verifyJwtToken(token);
  (req as any).user = decoded;
  next();
};
