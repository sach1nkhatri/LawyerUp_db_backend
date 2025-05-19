const express = require('express');
const router = express.Router();
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

module.exports = router;
