const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();


app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json()); // 🚨 REQUIRED to parse JSON from frontend

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected✅'))
  .catch(err => console.error('Mongo error:', err));

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
