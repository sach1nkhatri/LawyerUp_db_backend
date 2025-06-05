const express = require('express');
const router = express.Router();
const News = require('../models/News'); // <-- Required
const authMiddleware = require('../middleware/authMiddleware');
const {
    getAllNews,
    createNews,
    updateNews,
    deleteNews
} = require('../controllers/newsController');

// Route definitions (handlers must be functions!)
router.get('/', getAllNews);
router.post('/', createNews);
router.put('/:id', updateNews);
router.delete('/:id', deleteNews);
router.post('/:id/like', async (req, res) => {
    const { userId } = req.body;
    const news = await News.findById(req.params.id);

    if (!news) return res.status(404).json({ error: 'News not found' });

    if (news.likedBy.includes(userId)) return res.status(400).json({ error: 'Already liked' });

    // remove from dislike if exists
    news.dislikedBy = news.dislikedBy.filter(u => u !== userId);
    if (news.dislikedBy.length < (news.dislikes || 0)) news.dislikes--;

    news.likedBy.push(userId);
    news.likes++;
    await news.save();

    res.json({ likes: news.likes, dislikes: news.dislikes });
});

router.post('/:id/dislike', async (req, res) => {
    const { userId } = req.body;
    const news = await News.findById(req.params.id);

    if (!news) return res.status(404).json({ error: 'News not found' });

    if (news.dislikedBy.includes(userId)) return res.status(400).json({ error: 'Already disliked' });

    // remove from like if exists
    news.likedBy = news.likedBy.filter(u => u !== userId);
    if (news.likedBy.length < (news.likes || 0)) news.likes--;

    news.dislikedBy.push(userId);
    news.dislikes++;
    await news.save();

    res.json({ likes: news.likes, dislikes: news.dislikes });
});
// ... like and dislike routes ...

router.post('/:id/comment', authMiddleware, async (req, res) => {
    const text = req.body.text;
    const user = req.user.fullName || 'Anonymous'; // From decoded token via middleware

    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });

    news.comments.push({ user, text });
    await news.save();

    res.json({ comments: news.comments });
});

module.exports = router;


module.exports = router;
