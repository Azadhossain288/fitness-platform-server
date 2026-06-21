const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { verifyAdmin } = require('../middlewares/verifyRole');
const {
  createUser,
  getUserRole,
  getAllUsers,
  blockUser,
  unblockUser,
  makeAdmin,
  demoteTrainer,
} = require('../controllers/user.controller');

router.post('/', createUser);
router.get('/role/:email', verifyToken, getUserRole);
router.get('/', verifyToken, verifyAdmin, getAllUsers);
router.patch('/block/:id', verifyToken, verifyAdmin, blockUser);
router.patch('/unblock/:id', verifyToken, verifyAdmin, unblockUser);
router.patch('/make-admin/:id', verifyToken, verifyAdmin, makeAdmin);
router.patch('/demote/:id', verifyToken, verifyAdmin, demoteTrainer);

module.exports = router;
