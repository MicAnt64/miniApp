const express = require('express');
const stocksController = require('../controllers/stocksController');

const router = express.Router();

router.route('/').get(stocksController.getAllStocks);

module.exports = router;
