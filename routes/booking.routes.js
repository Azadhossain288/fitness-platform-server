const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const checkBlocked = require('../middlewares/checkBlocked');
const {
  checkBooking,
  getUserBookings,
  createBooking,
  checkEnrollment, 
} = require('../controllers/booking.controller');

// Route to check enrollment via query parameters (For the "Already Enrolled" button)
router.get('/check-enrollment', verifyToken, checkEnrollment);

// Original routes
router.get('/check/:classId', verifyToken, checkBooking);
router.get('/user/:email', verifyToken, getUserBookings);
router.post('/', verifyToken, checkBlocked, createBooking);

module.exports = router;