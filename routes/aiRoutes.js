const express = require('express');
const router = express.Router();
const ai = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/chats', authMiddleware, ai.getChats);
router.get('/chats/:id', authMiddleware, ai.getChatById);
router.post('/chats', authMiddleware, ai.createChat);
router.delete('/chats/:id', authMiddleware, ai.deleteChat);

router.post('/send', authMiddleware, ai.sendMessage);
router.post('/saveReply', authMiddleware, ai.saveReply);
router.post('/appendUserMessage', authMiddleware, ai.appendUserMessage);

module.exports = router;
