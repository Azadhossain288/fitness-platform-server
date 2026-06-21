const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { verifyAdmin } = require('../middlewares/verifyRole');
const {
  createPaymentIntent,
  savePayment,
  getAllPayments,
} = require('../controllers/payment.controller');

router.post('/create-payment-intent', verifyToken, createPaymentIntent);
router.post('/', verifyToken, savePayment);
router.get('/', verifyToken, verifyAdmin, getAllPayments);

module.exports = router;
