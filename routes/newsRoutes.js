const express = require('express');
const router = express.Router();
const News = require('../models/News');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const {
    getAllNews,
    createNews,
    updateNews,
    deleteNews
} = require('../controllers/newsController');

// Basic CRUD
router.get('/', getAllNews);

// ✅ Create news with image upload
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, summary, author, date } = req.body;
        const image = req.file ? `/uploads/news/${req.file.filename}` : '';
        const news = new News({ title, summary, author, date, image });
        await news.save();
        res.status(201).json(news);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ✅ Update news with optional image upload
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.image = `/uploads/news/${req.file.filename}`;
        }
        const updated = await News.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', deleteNews);

// 🧡 Like system
router.post('/:id/like', async (req, res) => {
    const { userId } = req.body;
    const news = await News.findById(req.params.id);

    if (!news) return res.status(404).json({ error: 'News not found' });
    if (news.likedBy.includes(userId)) return res.status(400).json({ error: 'Already liked' });

    news.dislikedBy = news.dislikedBy.filter(u => u !== userId);
    if (news.dislikedBy.length < (news.dislikes || 0)) news.dislikes--;

    news.likedBy.push(userId);
    news.likes++;
    await news.save();

    res.json({ likes: news.likes, dislikes: news.dislikes });
});

// 💔 Dislike system
router.post('/:id/dislike', async (req, res) => {
    const { userId } = req.body;
    const news = await News.findById(req.params.id);

    if (!news) return res.status(404).json({ error: 'News not found' });
    if (news.dislikedBy.includes(userId)) return res.status(400).json({ error: 'Already disliked' });

    news.likedBy = news.likedBy.filter(u => u !== userId);
    if (news.likedBy.length < (news.likes || 0)) news.likes--;

    news.dislikedBy.push(userId);
    news.dislikes++;
    await news.save();

    res.json({ likes: news.likes, dislikes: news.dislikes });
});

// 🔁 Undo dislike
router.post('/:id/undislike', async (req, res) => {
    const { userId } = req.body;
    const news = await News.findById(req.params.id);

    if (!news) return res.status(404).json({ error: 'News not found' });

    if (news.dislikedBy.includes(userId)) {
        news.dislikedBy = news.dislikedBy.filter(u => u !== userId);
        if (news.dislikes > 0) news.dislikes--;
    }

    await news.save();
    res.json({ likes: news.likes, dislikes: news.dislikes });
});

// 🔁 Undo like
router.post('/:id/unlike', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });

    if (news.likedBy.includes(userId)) {
        news.likedBy = news.likedBy.filter(u => u !== userId);
        if (news.likes > 0) news.likes--;
    }

    await news.save();
    res.json({ likes: news.likes, dislikes: news.dislikes });
});

// 💬 Add comment
router.post('/:id/comment', authMiddleware, async (req, res) => {
    const text = req.body.text;
    const user = req.user.fullName || 'Anonymous';

    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });

    news.comments.push({ user, text });
    await news.save();

    res.json({ comments: news.comments });
});

// ❌ Delete comment
router.delete('/:id/comment/:index', authMiddleware, async (req, res) => {
    const news = await News.findById(req.params.id);
    const commentIndex = parseInt(req.params.index);
    const user = req.user.fullName;

    if (!news) return res.status(404).json({ error: 'News not found' });

    const comment = news.comments[commentIndex];
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (comment.user !== user) {
        return res.status(403).json({ error: 'You can only delete your own comments.' });
    }

    news.comments.splice(commentIndex, 1);
    await news.save();

    res.json({ comments: news.comments });
});

module.exports = router;
