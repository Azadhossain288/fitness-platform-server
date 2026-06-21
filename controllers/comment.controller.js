const { getCollections } = require('../config/db');
const { ObjectId } = require('mongodb');

// GET /comments/:postId -> all comments for a post (top-level + replies)
const getCommentsByPost = async (req, res) => {
  const { commentsCollection } = getCollections();
  const postId = req.params.postId;
  const comments = await commentsCollection
    .find({ postId })
    .sort({ createdAt: 1 })
    .toArray();
  res.send(comments);
};

// POST /comments -> add comment or reply
const addComment = async (req, res) => {
  const { commentsCollection } = getCollections();
  const comment = {
    ...req.body, // { postId, text, authorName, authorEmail, authorImage, parentId (null if top-level) }
    createdAt: new Date(),
  };
  const result = await commentsCollection.insertOne(comment);
  res.send(result);
};

// PATCH /comments/:id -> edit own comment only (checked via authorEmail match)
const updateComment = async (req, res) => {
  const { commentsCollection } = getCollections();
  const id = req.params.id;
  const { text, email } = req.body;

  const comment = await commentsCollection.findOne({ _id: new ObjectId(id) });
  if (!comment) return res.status(404).send({ message: 'Comment not found' });
  if (comment.authorEmail !== email) {
    return res.status(403).send({ message: 'You can only edit your own comment' });
  }

  const result = await commentsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { text, editedAt: new Date() } }
  );
  res.send(result);
};

// DELETE /comments/:id -> delete own comment (email passed in query for ownership check)
const deleteComment = async (req, res) => {
  const { commentsCollection } = getCollections();
  const id = req.params.id;
  const { email } = req.query;

  const comment = await commentsCollection.findOne({ _id: new ObjectId(id) });
  if (!comment) return res.status(404).send({ message: 'Comment not found' });
  if (comment.authorEmail !== email) {
    return res.status(403).send({ message: 'You can only delete your own comment' });
  }

  const result = await commentsCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
};

module.exports = { getCommentsByPost, addComment, updateComment, deleteComment };
