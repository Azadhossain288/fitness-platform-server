const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Called from client right after Better Auth login succeeds.
// Client sends user email -> server issues our own JWT for API protection.
router.post('/jwt', async (req, res) => {
  const user = req.body; // { email }
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '7d',
  });

  res
    .cookie('token', token, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none', 
    })
    .send({ success: true });
});

router.post('/logout', (req, res) => {
  res
    .clearCookie('token', {
      httpOnly: true,
      secure: true,              
      sameSite: 'none',          
      maxAge: 0,
    })

    .send({ success: true });
});

module.exports = router;
