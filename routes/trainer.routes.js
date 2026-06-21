const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { verifyAdmin } = require('../middlewares/verifyRole');
const checkBlocked = require('../middlewares/checkBlocked');
const {
  applyAsTrainer,
  getPendingApplications,
  approveApplication,
  rejectApplication,
  getAllTrainers,
} = require('../controllers/trainer.controller');

router.post('/', verifyToken, checkBlocked, applyAsTrainer);
router.get('/', verifyToken, verifyAdmin, getPendingApplications);
router.get('/trainers', verifyToken, verifyAdmin, getAllTrainers);
router.patch('/approve/:id', verifyToken, verifyAdmin, approveApplication);
router.patch('/reject/:id', verifyToken, verifyAdmin, rejectApplication);

module.exports = router;
