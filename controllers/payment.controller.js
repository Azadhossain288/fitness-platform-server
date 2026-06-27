const { getCollections } = require('../config/db');
const { ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const domain = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://fitness-platform-client-rxw4.vercel.app';

/**
 * @desc    Create a Stripe Checkout Session for a hosted payment page.
 * @route   POST /payments/create-checkout-session
 */
const createCheckoutSession = async (req, res) => {
  try {
    const { className, price, classId, userEmail } = req.body;

    if (!price || isNaN(price)) {
      return res.status(400).send({ message: "Invalid or missing price amount" });
    }

    // Configure the Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: className,
              metadata: { classId, userEmail }
            },
            unit_amount: Math.round(price * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Return to your frontend with necessary transaction details
      success_url: `${domain}/payment-success?session_id={CHECKOUT_SESSION_ID}&classId=${classId}&email=${userEmail}&price=${price}&className=${encodeURIComponent(className)}`,
      cancel_url: `${domain}/class-details/${classId}`,
    });

    // Send the checkout URL to the frontend for redirection
    res.send({ url: session.url });
  } catch (error) {
    console.error("Stripe Session Error:", error.message);
    res.status(500).send({ message: "Failed to create checkout session", error: error.message });
  }
};

/**
 * @desc    Save transaction record to database after successful payment.
 * @route   POST /payments
 */
const savePayment = async (req, res) => {
  const { paymentsCollection, classesCollection, bookingsCollection } = getCollections();
  const payment = req.body; 

  try {
    if (!payment.classId || !payment.userEmail) {
      return res.status(400).send({ message: "Missing required payment fields" });
    }

    // 1. Record the transaction in the payments ledger
    const result = await paymentsCollection.insertOne({
      ...payment,
      date: new Date(),
    });

    // 2. Increment the booking count for the specific class
    if (payment.classId && ObjectId.isValid(payment.classId)) {
      await classesCollection.updateOne(
        { _id: new ObjectId(payment.classId) },
        { $inc: { bookingCount: 1 } }
      );
    }

    // 3. Log the booking in the system for user dashboard access
    if (bookingsCollection && payment.classId) {
      await bookingsCollection.insertOne({
        userEmail: payment.userEmail,
        classId: payment.classId,
        className: payment.className,
        transactionId: payment.transactionId,
        bookedAt: new Date()
      });
    }

    res.send({ success: true, result });
  } catch (error) {
    console.error("Error in payment workflow:", error.message);
    res.status(500).send({ message: "Failed to process enrollment", error: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const { paymentsCollection } = getCollections();
    const payments = await paymentsCollection.find().sort({ date: -1 }).toArray();
    res.send(payments);
  } catch (error) {
    res.status(500).send({ message: "Error fetching payments", error: error.message });
  }
};

module.exports = { createCheckoutSession, savePayment, getAllPayments };