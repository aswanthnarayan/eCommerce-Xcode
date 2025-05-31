

import express from "express";
import { 
    createProduct, 
    getProducts, 
    getProduct, 
    updateProduct, 
    deleteProduct 
} from "../controllers/ProductController.js";
import { authenticateToken, isAdmin } from "../middlewares/auth.js";
import upload from "../utils/Multer.js";

const router = express.Router();


// Public routes
router.get("/", getProducts);
router.get("/:id", getProduct);

// Protected routes (require authentication and admin role)
router.post("/", authenticateToken, isAdmin, upload.single('image'), createProduct);
router.patch("/:id", authenticateToken, isAdmin, upload.single('image'), updateProduct);
router.delete("/:id", authenticateToken, isAdmin, deleteProduct);

export default router;