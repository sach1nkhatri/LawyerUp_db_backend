const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken'); // assume you created this

exports.register = async (req, res) => {
  const {
    fullName,
    email,
    password,
    role = 'user', // default to 'user'
    contactNumber
  } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      contactNumber
    });

    // Prepare user object without password
    const userResponse = {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      plan: newUser.plan || 'Free Trial',
      contactNumber: newUser.contactNumber
    };

    res.status(201).json({
      user: userResponse,
      token: generateToken(newUser._id)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });    
    res.json({
      user,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateProfile = async (req, res) => {
  const { name, contactNumber, city, state, address } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update only fields provided
    if (name) user.fullName = name;
    if (contactNumber) user.contactNumber = contactNumber;
    if (city) user.city = city;
    if (state) user.state = state;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
