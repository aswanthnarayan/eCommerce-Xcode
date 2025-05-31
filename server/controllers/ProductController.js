
import Product from "../models/Products.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Create 
export const createProduct = async (req, res) => {
    try {
        const { name, price, description, stock } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: "Image is required"
            });
        }
        const imagePath = req.file.path.replace(/\\/g, '/');
        const imageUrl = `${process.env.BASE_URL}/${imagePath}`;

        const product = new Product({
            name,
            price: Number(price), 
            description,
            stock: Number(stock) || 0, 
            imageUrl: imageUrl
        });

        await product.save();
        res.status(201).json({ 
            success: true, 
            product 
        });
    } catch (error) {
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
                console.log('Cleaned up uploaded file due to error:', req.file.path);
            } catch (fsError) {
                console.error('Error cleaning up file:', fsError);
            }
        }
        console.error('Create product error:', error);
        res.status(500).json({ 
            message: "Error creating product" 
        });
    }
};

// Get All Products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        if (!products) {
            return res.status(404).json({ 
                success: false, 
                message: "No products found" 
            });
        }
        res.status(200).json({ 
            success: true, 
            products 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching products" 
        });
    }
};

// Get Single Product
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).where({isActive:true});
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }
        res.status(200).json({ 
            success: true, 
            product 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching product" 
        });
    }
};

// Update Product
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            // Clean up uploaded file if product not found
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }

        const updates = {};
        const updateFields = ['name', 'price', 'description', 'stock','isActive'];
        
        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                if (field === 'price' || field === 'stock') {
                    updates[field] = Number(req.body[field]);
                } else if (field === 'isActive') {
                    updates[field] = req.body[field] === 'true' || req.body[field] === true;
                } else {
                    updates[field] = req.body[field];
                }
            }
        });

        
        // If new image is uploaded, delete the old one
        if (req.file) {
            // Delete old image if it exists
            if (product.imageUrl) {
                // Remove the base URL and leading slash to get the relative path
                const relativePath = product.imageUrl.replace(process.env.BASE_URL, '').replace(/^\//, '');
                const oldImagePath = path.join(process.cwd(), 'uploads', relativePath);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            
            // Add new image path
            const imagePath = req.file.path.replace(/\\/g, '/');
            updates.imageUrl = `${process.env.BASE_URL}/${imagePath}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.status(200).json({ 
            success: true, 
            product: updatedProduct 
        });
    } catch (error) {
        // Clean up uploaded file if error occurs
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating product" 
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }

        // Soft delete
        product.isActive = false;
        product.updatedAt = Date.now();
        await product.save();

        // Note: We're not deleting the image file in case it's referenced elsewhere
        // or if you want to restore the product later

        res.status(200).json({ 
            success: true, 
            message: "Product deleted successfully" 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting product" 
        });
    }
};

