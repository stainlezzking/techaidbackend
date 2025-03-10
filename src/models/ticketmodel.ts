import mongoose, { Schema, Document, model } from "mongoose";

// Define Ticket Interface
export interface ITicket extends Document {
  title: string;
  description: string;
  status: "open" | "in-progress" | "resolved";
  userId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId | null;
  notes?: [{ id: mongoose.Types.ObjectId; name: String; message: String }];
  priority: "low" | "mid" | "high";
  contactMethod: string;
  displayId: string;
  category: string;
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
    priority: { type: String, enum: ["low", "mid", "high"], default: "low" },
    category: String,
    contactMethod: String,
    displayId: String,
    // this id in the note is to maintain consistency with the design, i want to be able
    // to be able to confirm if it is the current user that made it so i can write You:
    notes: [{ id: Schema.Types.ObjectId, name: String, message: String }],
  },
  { timestamps: true }
);

export interface ITicketAuto extends Document {
  automated: boolean;
  currentIndex: number;
  supportStaffs: [{ index: number; supportId: mongoose.Types.ObjectId; openTickets: number }];
}
/*
The 
*/
const AutomatedSystemSchema = new Schema<ITicketAuto>({
  automated: { type: Boolean, default: true },
  currentIndex: { type: Number, default: 0 },
  supportStaffs: [{ index: Number, supportId: Schema.Types.ObjectId, openTickets: { type: Number, default: 0 } }],
});

export const AutomatedTicketSystem = model<ITicketAuto>("automatedSystem", AutomatedSystemSchema);
export const Ticket = model<ITicket>("Ticket", TicketSchema);
