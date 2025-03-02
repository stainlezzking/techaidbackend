import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
dotenv.config();

import staffRouter from "./routes/staff";

app.use("/staffs", staffRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("server running "));
