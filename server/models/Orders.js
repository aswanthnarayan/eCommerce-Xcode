import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: String,
    products: Array,
    total: Number
});

export default mongoose.model("Order", orderSchema);
