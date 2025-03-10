import mongoose, { Schema, Document, model } from "mongoose";
export interface INotification extends Document {
  message: string;
  seen: boolean;
  ticketId: string;
  userId: mongoose.Types.ObjectId;
}
/*
The 
*/
const NotSchema = new Schema<INotification>(
  {
    message: String,
    seen: { type: Boolean, default: false },
    ticketId: String,
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotification>("notifications", NotSchema);
export default Notification;
