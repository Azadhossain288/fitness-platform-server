const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const checkBlocked = require('../middlewares/checkBlocked');
const {
  getAllPosts,
  getLatestPosts,
  getPostById,
  getPostsByAuthor,
  addPost,
  deletePost,
  votePost,
} = require('../controllers/forum.controller');

router.get('/', getAllPosts); // public, paginated
router.get('/latest', getLatestPosts); // public, home page
router.get('/author/:email', verifyToken, getPostsByAuthor);
router.get('/:id', verifyToken, getPostById); // private - post details

router.post('/', verifyToken, checkBlocked, addPost); // trainer/admin
router.patch('/vote/:id', verifyToken, checkBlocked, votePost);
router.delete('/:id', verifyToken, deletePost);

module.exports = router;
