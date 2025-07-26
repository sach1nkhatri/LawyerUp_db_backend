const express = require('express');
const router = express.Router();
const { getAnalyticsData } = require('../controllers/analyticsController');

router.get('/realtime', getAnalyticsData);

module.exports = router;
