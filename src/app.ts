import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import staffRouter from "./routes/staff";
import authRouter from "./routes/auth";
import ticketRouter from "./routes/ticket";
import cors from "cors";

const app = express();
app.use(cors());
app.use(cookieParser());
connectDB().catch((e) => console.log("An error occured connecting to the DB"));

app.use("/staffs", staffRouter);
app.use("/auth", authRouter);
app.use("/ticket", ticketRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("server running "));
