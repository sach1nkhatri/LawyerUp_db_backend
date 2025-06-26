const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ai = require('../controllers/aiController');

router.use(auth);

router.get('/chats', ai.getChats);
router.get('/chats/:id', ai.getChatById);
router.post('/chats', ai.createChat);
router.delete('/chats/:id', ai.deleteChat);
router.post('/send', ai.sendMessage);

module.exports = router;
