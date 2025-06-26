const Chat = require('../models/chat');

// 📜 Get all chats for the logged-in user
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(chats);
  } catch (err) {
    console.error('Failed to fetch chats:', err.message);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

// 📜 Get a specific chat by ID
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    console.error('Failed to get chat:', err.message);
    res.status(500).json({ error: 'Failed to get chat' });
  }
};

// ➕ Create a new empty chat
exports.createChat = async (req, res) => {
  try {
    const newChat = await Chat.create({
      user: req.user._id,
      messages: [],
      title: req.body.title || 'New Chat',
      model: req.body.model || 'gemma-3-12b-it-q4f'
    });
    res.status(201).json(newChat);
  } catch (err) {
    console.error('Failed to create chat:', err.message);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

// ❌ Delete a chat
exports.deleteChat = async (req, res) => {
  try {
    await Chat.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    console.error('Failed to delete chat:', err.message);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};

// 💬 Send a message to the AI and store the result


exports.sendMessage = async (req, res) => {
  // Dynamic fetch import for CommonJS compatibility
  const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

  const { chatId, message, model } = req.body;

  if (!chatId || !message || !model) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const chat = await Chat.findOne({ _id: chatId, user: req.user._id });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    chat.messages.push({ role: 'user', content: message });

    const payload = {
      model,
      stream: false, // ✅ this ensures a complete response, safe for backend
      messages: [
        { role: "system", content: "You are a helpful Nepali legal advisor." },
        ...chat.messages
      ],
      temperature: 0.7
    };

    const aiRes = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("❌ LLM error response:", errText);
      return res.status(502).json({ error: 'LLM returned error', detail: errText });
    }

    const data = await aiRes.json();
    console.log('🧠 LLM Response:', data);

    if (!data.choices || !data.choices[0]?.message) {
      return res.status(500).json({ error: 'Malformed AI response', detail: data });
    }

    const aiMessage = data.choices[0].message;
    chat.messages.push(aiMessage);
    await chat.save();

    res.json({ reply: aiMessage, chatId: chat._id });

  } catch (error) {
    console.error('🔥 LLM request failed:', error.message);
    res.status(503).json({ error: 'LLM server not reachable', detail: error.message });
  }
};
