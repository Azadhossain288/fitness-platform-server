const { getCollections } = require('../config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /payments/create-payment-intent -> body: { price } (price in dollars)
const createPaymentIntent = async (req, res) => {
  const { price } = req.body;
  const amount = Math.round(price * 100); // stripe needs cents

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    payment_method_types: ['card'],
  });

  res.send({ clientSecret: paymentIntent.client_secret });
};

// POST /payments -> save transaction record after successful payment
const savePayment = async (req, res) => {
  const { paymentsCollection } = getCollections();
  const payment = req.body; // { email, amount, transactionId, classId, className }

  const result = await paymentsCollection.insertOne({
    ...payment,
    date: new Date(),
  });
  res.send(result);
};

// GET /payments -> admin only, Transactions page
const getAllPayments = async (req, res) => {
  const { paymentsCollection } = getCollections();
  const payments = await paymentsCollection.find().sort({ date: -1 }).toArray();
  res.send(payments);
};

module.exports = { createPaymentIntent, savePayment, getAllPayments };
