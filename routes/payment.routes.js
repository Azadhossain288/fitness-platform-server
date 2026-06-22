const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { 
  createCheckoutSession, 
  savePayment, 
  getAllPayments 
} = require('../controllers/payment.controller');

// Route to initiate the Stripe Checkout session
router.post('/create-checkout-session', verifyToken, createCheckoutSession);

// Route to save payment details after successful transaction
router.post('/', verifyToken, savePayment);

// Route to fetch all payment records (for Admin auditing)
router.get('/', verifyToken, getAllPayments);

module.exports = router;