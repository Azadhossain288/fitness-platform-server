const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      process.env.CLIENT_URL, // your deployed frontend url
    ].filter(Boolean), // If dont get CLIENT_URL  do not give undefined error
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Test Route
app.get('/', (req, res) => {
  res.send('Fitness Platform Server is Running 🏋️');
});

// Routes Imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const classRoutes = require('./routes/class.routes');
const bookingRoutes = require('./routes/booking.routes');
const favoriteRoutes = require('./routes/favorite.routes'); 
const trainerRoutes = require('./routes/trainer.routes');
const forumRoutes = require('./routes/forum.routes');
const commentRoutes = require('./routes/comment.routes');
const paymentRoutes = require('./routes/payment.routes');

// Routes Mounting
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/classes', classRoutes);
app.use('/bookings', bookingRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/trainer-applications', trainerRoutes);
app.use('/forum-posts', forumRoutes);
app.use('/comments', commentRoutes);
app.use('/payments', paymentRoutes);

// Global Error Handler 
app.use((err, req, res, next) => {
  console.error(' Server Error:', err.message);
  res.status(500).send({ message: 'Internal Server Error', error: err.message });
});

// DB Connection and Server Start
const { connectDB } = require('./config/db');

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(' Database connection failed:', err);
  });


