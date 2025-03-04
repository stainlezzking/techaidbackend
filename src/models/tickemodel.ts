import mongoose, { Schema, Document, model } from "mongoose";

// Define Ticket Interface
export interface ITicket extends Document {
  title: string;
  description: string;
  status: "open" | "in-progress" | "resolved";
  userId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId | null;
  notes?: [{ id: mongoose.Types.ObjectId; name: String; message: String }];
  createdAt: Date;
  updatedAt: Date;
}

// Define Ticket Schema
const TicketSchema = new Schema<ITicket>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["open", "in-progress", "resolved"], default: "open" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    // this id in the note is to maintain consistency with the design, i want to be able
    // to be able to confirm if it is the current user that made it so i can write You:
    notes: [{ id: Schema.Types.ObjectId, name: String, message: String }],
  },
  { timestamps: true }
);

export const Ticket = model<ITicket>("Ticket", TicketSchema);
