const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: [true, 'A stock symbol is required.'],
        unique: true
    },
    companyName: { type: String },
    currentPrice: { type: Number, required: [true, 'Stock price required.'] },
    previousClose: { type: Number },
    companyWebSite: { type: String }
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
