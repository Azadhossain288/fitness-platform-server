const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const checkBlocked = require('../middlewares/checkBlocked');
const {
  checkBooking,
  getUserBookings,
  createBooking,
} = require('../controllers/booking.controller');

router.get('/check/:classId', verifyToken, checkBooking);
router.get('/user/:email', verifyToken, getUserBookings);
router.post('/', verifyToken, checkBlocked, createBooking);

module.exports = router;
