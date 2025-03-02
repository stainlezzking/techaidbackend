import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";

const app = express();

app.use(cookieParser());
connectDB().catch((e) => console.log("An error occured connecting to the DB"));

import staffRouter from "./routes/staff";

app.use("/staffs", staffRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("server running "));
