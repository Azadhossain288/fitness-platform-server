const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { verifyAdmin, verifyTrainer } = require('../middlewares/verifyRole');
const {
  getAllClasses,
  getFeaturedClasses,
  getClassById,
  getClassesByTrainer,
  addClass,
  updateClass,
  deleteClass,
  getClassAttendees,
} = require('../controllers/class.controller');

router.get('/', getAllClasses); // public, approved only, search+filter+pagination
router.get('/featured', getFeaturedClasses); // public, home page
router.get('/trainer/:email', verifyToken, verifyTrainer, getClassesByTrainer);
router.get('/:id', verifyToken, getClassById); // private - class details
router.get('/:id/attendees', verifyToken, verifyTrainer, getClassAttendees);

router.post('/', verifyToken, verifyTrainer, addClass);
router.patch('/:id', verifyToken, updateClass); // trainer edits own / admin changes status
router.delete('/:id', verifyToken, deleteClass);

module.exports = router;
