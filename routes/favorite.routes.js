const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const checkBlocked = require('../middlewares/checkBlocked');
const {
  checkFavorite,
  getUserFavorites,
  addFavorite,
  removeFavorite,
} = require('../controllers/favorite.controller');

router.get('/check/:classId', verifyToken, checkFavorite);
router.get('/user/:email', verifyToken, getUserFavorites);
router.post('/', verifyToken, checkBlocked, addFavorite);
router.delete('/:id', verifyToken, removeFavorite);

module.exports = router;
