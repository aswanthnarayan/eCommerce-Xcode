import axios from "./axios.js";

export const createPayment = async (productId) => {
    try {
        const response = await axios.post("/payment/create-checkout-session", { productId });
        return response;
    } catch (error) {
        console.error("Payment API error:", error);
        throw error;
    }
};