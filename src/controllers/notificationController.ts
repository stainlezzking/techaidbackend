import { Request, Response } from "express";
import { AuthenticatedRequest } from "../@types/user";
import Notification from "../models/notificationmodel";
import mongoose from "mongoose";

export const getMyNotificatoins = async function (req: AuthenticatedRequest, res: Response) {
  const notifications = await Notification.find({ userId: req.user!._id });
  res.json({
    success: true,
    data: notifications,
  });
};
