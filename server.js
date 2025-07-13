const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Routes
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const lawyerRoutes = require('./routes/LawyerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reportRoutes = require('./routes/reportRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const faqRoutes = require('./routes/faqRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); 
const aiRoutes = require('./routes/aiRoutes')

// Setup
dotenv.config();
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000'
];

app.use(cors({
  origin: '*',
  credentials: true
}));




app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected ✅'))
  .catch(err => console.error('Mongo error:', err));

// Express Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/pdfs', pdfRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/manual-payment', paymentRoutes);


// ✅ SOCKET.IO: Real-time chat logic
const Booking = require('./models/Booking');

io.on('connection', (socket) => {
  console.log('🔌 Socket connected');

  socket.on('joinRoom', (bookingId) => {
    socket.join(bookingId);
  });

  socket.on('sendMessage', async ({ bookingId, senderId, text, senderName }) => {
    const message = {
      sender: senderId,
      text,
      timestamp: new Date(),
      status: 'sent'
    };

    await Booking.findByIdAndUpdate(bookingId, { $push: { messages: message } });

    io.to(bookingId).emit('receiveMessage', {
      ...message,
      sender: {
        _id: senderId,
        fullName: senderName
      }
    });
  });

  // ✅ Handle typing notification
  socket.on('userTyping', (bookingId) => {
    socket.to(bookingId).emit('userTyping');
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });
});


  


// Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 LawyerUp firing ${PORT}`);
});
