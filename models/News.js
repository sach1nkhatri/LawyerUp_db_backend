const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: String,
    author: String,
    summary: String,
    date: String,
    image: String, // URL to image
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
