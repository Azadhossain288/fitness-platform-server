const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const checkBlocked = require('../middlewares/checkBlocked');
const {
  getCommentsByPost,
  addComment,
  updateComment,
  deleteComment,
} = require('../controllers/comment.controller');

router.get('/:postId', verifyToken, getCommentsByPost);
router.post('/', verifyToken, checkBlocked, addComment);
router.patch('/:id', verifyToken, updateComment);
router.delete('/:id', verifyToken, deleteComment);

module.exports = router;
