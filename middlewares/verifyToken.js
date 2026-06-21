const jwt = require('jsonwebtoken');

// Verifies JWT from HTTPOnly cookie
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: 'Unauthorized access' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized access' });
    }
    req.decoded = decoded; // { email, role, ... }
    next();
  });
};

module.exports = verifyToken;
