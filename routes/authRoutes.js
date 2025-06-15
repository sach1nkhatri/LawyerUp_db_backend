const express = require('express');
const router = express.Router();
const { register, login, updateProfile } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/signup', register);
router.post('/login', login);

// 🔐 Authenticated user route
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/update-profile', auth, updateProfile);
module.exports = router;
