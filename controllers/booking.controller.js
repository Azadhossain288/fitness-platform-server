const { getCollections } = require('../config/db');
const { ObjectId } = require('mongodb');

// GET /bookings/check/:classId?email=... -> Class Details page e button state set korte
const checkBooking = async (req, res) => {
  const { bookingsCollection } = getCollections();
  const { classId } = req.params;
  const { email } = req.query;

  const existing = await bookingsCollection.findOne({
    classId,
    studentEmail: email,
  });

  res.send({ alreadyBooked: !!existing });
};

// GET /bookings/user/:email -> user's "Booked Classes" page
const getUserBookings = async (req, res) => {
  const { bookingsCollection } = getCollections();
  const email = req.params.email;
  const bookings = await bookingsCollection.find({ studentEmail: email }).toArray();
  res.send(bookings);
};

// POST /bookings -> called from Payment Page AFTER successful stripe payment
const createBooking = async (req, res) => {
  const { bookingsCollection, classesCollection } = getCollections();
  const booking = req.body;
  // booking = { classId, className, trainerEmail, trainerName, schedule,
  //             studentEmail, studentName, price, transactionId }

  // Safety: prevent duplicate booking even if user double-clicks / re-submits payment
  const existing = await bookingsCollection.findOne({
    classId: booking.classId,
    studentEmail: booking.studentEmail,
  });
  if (existing) {
    return res.status(409).send({ message: 'You have already booked this class' });
  }

  const result = await bookingsCollection.insertOne({
    ...booking,
    bookedAt: new Date(),
  });

  // increment bookingCount on the class for "Featured Classes" sorting
  await classesCollection.updateOne(
    { _id: new ObjectId(booking.classId) },
    { $inc: { bookingCount: 1 } }
  );

  res.send(result);
};

module.exports = { checkBooking, getUserBookings, createBooking };
