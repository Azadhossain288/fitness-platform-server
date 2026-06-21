const { getCollections } = require('../config/db');
const { ObjectId } = require('mongodb');

// GET /forum-posts -> public, paginated
const getAllPosts = async (req, res) => {
  const { forumPostsCollection } = getCollections();
  const { page = 1, limit = 6 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const posts = await forumPostsCollection
    .find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .toArray();

  const total = await forumPostsCollection.countDocuments();

  res.send({ posts, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
};

// GET /forum-posts/latest -> public, home page, 4 most recent
const getLatestPosts = async (req, res) => {
  const { forumPostsCollection } = getCollections();
  const posts = await forumPostsCollection
    .find()
    .sort({ createdAt: -1 })
    .limit(4)
    .toArray();
  res.send(posts);
};

// GET /forum-posts/:id -> private, post details
const getPostById = async (req, res) => {
  const { forumPostsCollection } = getCollections();
  const id = req.params.id;
  const result = await forumPostsCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
};

// GET /forum-posts/author/:email -> trainer/admin's own posts
const getPostsByAuthor = async (req, res) => {
  const { forumPostsCollection } = getCollections();
  const email = req.params.email;
  const result = await forumPostsCollection.find({ authorEmail: email }).toArray();
  res.send(result);
};

// POST /forum-posts -> trainer or admin
const addPost = async (req, res) => {
  const { forumPostsCollection } = getCollections();
  const post = {
    ...req.body, // { title, image, description, authorName, authorEmail, authorRole }
    likes: [],   // array of user emails who liked
    dislikes: [], // array of user emails who disliked
    createdAt: new Date(),
  };
  const result = await forumPostsCollection.insertOne(post);
  res.send(result);
};

// DELETE /forum-posts/:id -> author (trainer, own post) or admin (any post)
const deletePost = async (req, res) => {
  const { forumPostsCollection } = getCollections();
  const id = req.params.id;
  const result = await forumPostsCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
};

// PATCH /forum-posts/vote/:id -> private, body: { email, type: 'like' | 'dislike' }
const votePost = async (req, res) => {
  const { forumPostsCollection } = getCollections();
  const id = req.params.id;
  const { email, type } = req.body;

  const post = await forumPostsCollection.findOne({ _id: new ObjectId(id) });
  if (!post) return res.status(404).send({ message: 'Post not found' });

  const likes = post.likes || [];
  const dislikes = post.dislikes || [];

  let newLikes = likes.filter((e) => e !== email);
  let newDislikes = dislikes.filter((e) => e !== email);

  // toggle: if user clicks the same vote again, it removes the vote
  const alreadyLiked = likes.includes(email);
  const alreadyDisliked = dislikes.includes(email);

  if (type === 'like' && !alreadyLiked) {
    newLikes.push(email);
  } else if (type === 'dislike' && !alreadyDisliked) {
    newDislikes.push(email);
  }
  // if type === 'like' and alreadyLiked -> just removed above (toggle off)
  // if type === 'dislike' and alreadyDisliked -> just removed above (toggle off)

  await forumPostsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { likes: newLikes, dislikes: newDislikes } }
  );

  res.send({ likes: newLikes, dislikes: newDislikes });
};

module.exports = {
  getAllPosts,
  getLatestPosts,
  getPostById,
  getPostsByAuthor,
  addPost,
  deletePost,
  votePost,
};
