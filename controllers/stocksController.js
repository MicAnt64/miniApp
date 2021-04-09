const StockModel = require('../models/stocksModel');

exports.getAllStocks = async (req, res) => {
    try {
        const stocks = await StockModel.find().select('-_id -__v');

        res.status(200).json({ stocks });
    } catch (err) {
        res.status(404).json({
            message: err
        });
    }
};
