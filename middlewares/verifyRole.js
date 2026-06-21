const { getCollections } = require('../config/db');

// Use AFTER verifyToken. Checks role from DB (not just token) for safety.
const verifyAdmin = async (req, res, next) => {
  const email = req.decoded?.email;
  const { usersCollection } = getCollections();
  const user = await usersCollection.findOne({ email });

  if (!user || user.role !== 'admin') {
    return res.status(403).send({ message: 'Forbidden access: Admins only' });
  }
  next();
};

const verifyTrainer = async (req, res, next) => {
  const email = req.decoded?.email;
  const { usersCollection } = getCollections();
  const user = await usersCollection.findOne({ email });

  if (!user || user.role !== 'trainer') {
    return res.status(403).send({ message: 'Forbidden access: Trainers only' });
  }
  next();
};

module.exports = { verifyAdmin, verifyTrainer };
