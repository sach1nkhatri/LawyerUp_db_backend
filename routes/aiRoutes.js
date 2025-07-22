const express = require('express');
const router = express.Router();
const ai = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// Chat CRUD
router.get('/chats', authMiddleware, ai.getChats);
router.get('/chats/:id', authMiddleware, ai.getChatById);
router.post('/chats', authMiddleware, ai.createChat);
router.delete('/chats/all', authMiddleware, ai.deleteAllChats); 
router.delete('/chats/:id', authMiddleware, ai.deleteChat);


// AI Messaging
router.post('/send', authMiddleware, ai.sendMessage);
router.post('/saveReply', authMiddleware, ai.saveReply);
router.post('/appendUserMessage', authMiddleware, ai.appendUserMessage);

module.exports = router;
