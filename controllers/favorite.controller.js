const { getCollections } = require('../config/db');
const { ObjectId } = require('mongodb');

// GET /favorites/check/:classId?email=...
const checkFavorite = async (req, res) => {
  const { favoritesCollection } = getCollections();
  const { classId } = req.params;
  const { email } = req.query;

  const existing = await favoritesCollection.findOne({
    classId,
    $or: [{ userEmail: email }, { email: email }]
  });
  res.send({ isFavorite: !!existing, favoriteId: existing?._id || null });
};

// GET /favorites/user/:email
const getUserFavorites = async (req, res) => {
  const { favoritesCollection } = getCollections();
  const email = req.params.email;
  const favorites = await favoritesCollection.find({
    $or: [{ userEmail: email }, { email: email }]
  }).toArray();
  res.send(favorites);
};

// POST /favorites
const addFavorite = async (req, res) => {
  const { favoritesCollection } = getCollections();
  const favorite = req.body;

  const existing = await favoritesCollection.findOne({
    classId: favorite.classId,
    $or: [{ userEmail: favorite.userEmail }, { email: favorite.email }]
  });
  if (existing) {
    return res.status(409).send({ message: 'Already in favorites' });
  }

  const result = await favoritesCollection.insertOne({
    ...favorite,
    addedAt: new Date(),
  });
  res.send(result);
};

// DELETE /favorites/:id
const removeFavorite = async (req, res) => {
  const { favoritesCollection } = getCollections();
  const id = req.params.id;
  const result = await favoritesCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
};

module.exports = { checkFavorite, getUserFavorites, addFavorite, removeFavorite };