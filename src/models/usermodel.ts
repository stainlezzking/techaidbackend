import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends Document {
  fullname: string;
  email: string;
  department: string;
  password: string;
  twoFactorSecret: {
    secret: string;
    encoding: string;
  };
  availability: "online" | "busy" | "Offline";
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
    twoFactorSecret: {
      secret: { type: String, select: false },
      encoding: { type: String, select: false },
    },
    availability: { type: String, enum: ["online", "busy", "Offline"] },
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

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export { UserSchema, IUser };
export const User = mongoose.model<IUser>("User", UserSchema);
