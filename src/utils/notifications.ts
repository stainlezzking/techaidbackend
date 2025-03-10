import { Schema } from "mongoose";
import Notification from "../models/notificationmodel";

export const SendNotification = async function (ticketId: String, ReceiverId: Schema.Types.ObjectId, message: String) {
  // this should add the notification to the user schema and then send an email
  Notification.create({
    ticketId,
    userId: ReceiverId,
    message,
  });
};
