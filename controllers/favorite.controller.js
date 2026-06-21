const { getCollections } = require('../config/db');
const { ObjectId } = require('mongodb');

// GET /favorites/check/:classId?email=...
const checkFavorite = async (req, res) => {
  const { favoritesCollection } = getCollections();
  const { classId } = req.params;
  const { email } = req.query;

  const existing = await favoritesCollection.findOne({
    classId,
    userEmail: email,
  });
  res.send({ isFavorite: !!existing });
};

// GET /favorites/user/:email -> Favorite Classes page
const getUserFavorites = async (req, res) => {
  const { favoritesCollection } = getCollections();
  const email = req.params.email;
  const favorites = await favoritesCollection.find({ userEmail: email }).toArray();
  res.send(favorites);
};

// POST /favorites -> add to favorites, prevent duplicate
const addFavorite = async (req, res) => {
  const { favoritesCollection } = getCollections();
  const favorite = req.body; // { classId, className, image, price, userEmail }

  const existing = await favoritesCollection.findOne({
    classId: favorite.classId,
    userEmail: favorite.userEmail,
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

// DELETE /favorites/:id -> remove from favorites
const removeFavorite = async (req, res) => {
  const { favoritesCollection } = getCollections();
  const id = req.params.id;
  const result = await favoritesCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
};

module.exports = { checkFavorite, getUserFavorites, addFavorite, removeFavorite };
