import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  fullname: string;
  email: string;
  department: string;
  password: string;
  url?: string;
  tickets: mongoose.Types.ObjectId[];
  role: "user" | "admin" | "support";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullname: {
      type: String,
      required: [true, "Full name is required."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address."],
    },
    department: {
      type: String,
      required: [true, "Department is required."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [6, "Password must be at least 6 characters long."],
      select: false,
    },
    url: String,
    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin", "support"],
      default: "user",
    },
  },
  { timestamps: true }
);

export { UserSchema, IUser };
