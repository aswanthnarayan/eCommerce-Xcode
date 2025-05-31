import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
dotenv.config();
import AuthRoutes from "./routes/AuthRoutes.js";
import cookieParser from "cookie-parser";
import ProductRoutes from "./routes/ProductRoutes.js";
import PaymentRoutes from "./routes/paymentRoutes.js";
import cors from "cors";
const PORT = process.env.PORT || 5000;
import { fileURLToPath } from 'url';
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
connectDB();

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true  
}));
app.use("/api/auth", AuthRoutes);
app.use("/api/products", ProductRoutes);
app.use("/api/payment", PaymentRoutes);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});