import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
dotenv.config();
import AuthRoutes from "./routes/AuthRoutes.js";
import cookieParser from "cookie-parser";
const PORT = process.env.PORT || 5000;

const app = express();
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", AuthRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});