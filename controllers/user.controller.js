const { getCollections } = require('../config/db');
const { ObjectId } = require('mongodb');

// POST /users -> called once after Better Auth registration to save user in our DB
const createUser = async (req, res) => {
  const { usersCollection } = getCollections();
  const userData = req.body;

  const existing = await usersCollection.findOne({ email: userData.email });
  if (existing) {
    return res.send({ message: 'User already exists', insertedId: null });
  }

  const newUser = {
    name: userData.name,
    email: userData.email,
    image: userData.image || '',
    role: 'user',          // everyone registers as user by default
    status: 'active',      // active | blocked
    trainerApplicationStatus: null, // null | pending | approved | rejected
    trainerFeedback: '',
    createdAt: new Date(),
  };

  const result = await usersCollection.insertOne(newUser);
  res.send(result);
};

// GET /users/role/:email -> used by frontend useUserRole hook
const getUserRole = async (req, res) => {
  const { usersCollection } = getCollections();
  const email = req.params.email;
  const user = await usersCollection.findOne({ email });
  res.send({ role: user?.role || 'user', status: user?.status || 'active' });
};

// GET /users -> admin only, all users
const getAllUsers = async (req, res) => {
  const { usersCollection } = getCollections();
  const search = req.query.search || '';
  const query = search
    ? { name: { $regex: search, $options: 'i' } }
    : {};
  const users = await usersCollection.find(query).toArray();
  res.send(users);
};

// PATCH /users/block/:id -> admin only
const blockUser = async (req, res) => {
  const { usersCollection } = getCollections();
  const id = req.params.id;
  const result = await usersCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: 'blocked' } }
  );
  res.send(result);
};

// PATCH /users/unblock/:id -> admin only
const unblockUser = async (req, res) => {
  const { usersCollection } = getCollections();
  const id = req.params.id;
  const result = await usersCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: 'active' } }
  );
  res.send(result);
};

// PATCH /users/make-admin/:id -> admin only
const makeAdmin = async (req, res) => {
  const { usersCollection } = getCollections();
  const id = req.params.id;
  const result = await usersCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { role: 'admin' } }
  );
  res.send(result);
};

// PATCH /users/demote/:id -> admin only (trainer -> user)
const demoteTrainer = async (req, res) => {
  const { usersCollection } = getCollections();
  const id = req.params.id;
  const result = await usersCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { role: 'user', trainerApplicationStatus: null } }
  );
  res.send(result);
};

module.exports = {
  createUser,
  getUserRole,
  getAllUsers,
  blockUser,
  unblockUser,
  makeAdmin,
  demoteTrainer,
};
