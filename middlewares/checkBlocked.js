const { getCollections } = require('../config/db');

// Use AFTER verifyToken on any POST/PUT/PATCH route a normal user can hit
// (booking, applying as trainer, commenting, voting etc.)
const checkBlocked = async (req, res, next) => {
  const email = req.decoded?.email;
  const { usersCollection } = getCollections();
  const user = await usersCollection.findOne({ email });

  if (user?.status === 'blocked') {
    return res
      .status(403)
      .send({ message: 'Action restricted by Admin' });
  }
  next();
};

module.exports = checkBlocked;
