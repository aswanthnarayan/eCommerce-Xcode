import express from 'express';
const router = express.Router();
import { createPayment, getCheckoutSession } from '../controllers/PaymentController.js';

router.post('/create-checkout-session', createPayment);

router.get('/session/:sessionId', getCheckoutSession);


export default router;