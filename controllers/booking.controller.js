const { getCollections } = require('../config/db');
const { ObjectId } = require('mongodb');

/**
 * @desc    Check if a student has already booked a specific class
 * @route   GET /bookings/check-enrollment
 */
const checkEnrollment = async (req, res) => {
  try {
    const { bookingsCollection } = getCollections();
    const { email, classId } = req.query;

    if (!email || !classId) {
      return res.status(400).send({ message: "Email and ClassId are required" });
    }

    const existing = await bookingsCollection.findOne({
      userEmail: email.trim(),
      classId: classId.trim()
    });

    res.status(200).send({ enrolled: !!existing });
  } catch (error) {
    console.error("Error in checkEnrollment:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

/**
 * @desc    Check booking compatibility (Legacy support)
 * @route   GET /bookings/check/:classId
 */
const checkBooking = async (req, res) => {
  try {
    const { bookingsCollection } = getCollections();
    const { classId } = req.params;
    const { email } = req.query;

    const existing = await bookingsCollection.findOne({
      classId: classId,
      userEmail: email,
    });

    res.status(200).send({ alreadyBooked: !!existing });
  } catch (error) {
    console.error("Error in checkBooking:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

/**
 * @desc    Get all bookings for a specific user
 * @route   GET /bookings/user/:email
 */
const getUserBookings = async (req, res) => {
  try {
    const { bookingsCollection } = getCollections();
    const email = req.params.email;
    const bookings = await bookingsCollection.find({ userEmail: email }).toArray();
    res.status(200).send(bookings);
  } catch (error) {
    console.error("Error in getUserBookings:", error);
    res.status(500).send({ message: "Failed to fetch user bookings" });
  }
};

/**
 * @desc    Create a new booking after successful payment
 * @route   POST /bookings
 */
const createBooking = async (req, res) => {
  try {
    const { bookingsCollection, classesCollection } = getCollections();
    const booking = req.body;

    // Check for existing booking
    const existing = await bookingsCollection.findOne({
      classId: booking.classId,
      userEmail: booking.userEmail,
    });

    if (existing) {
      return res.status(409).send({ message: 'You have already booked this class' });
    }

    // Insert new booking
    const result = await bookingsCollection.insertOne({
      ...booking,
      bookedAt: new Date(),
    });

    // Increment booking count
    if (booking.classId && ObjectId.isValid(booking.classId)) {
      await classesCollection.updateOne(
        { _id: new ObjectId(booking.classId) },
        { $inc: { bookingCount: 1 } }
      );
    }

    res.status(201).send({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("Error in createBooking:", error);
    res.status(500).send({ message: "Failed to create booking" });
  }
};

module.exports = { checkEnrollment, checkBooking, getUserBookings, createBooking };