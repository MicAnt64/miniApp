const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const _ = require('lodash');
const StockModel = require('./models/stocksModel');
const stockRouter = require('./routes/stocksRoute');
const { random, update } = require('lodash');
const cors = require('cors');

dotenv.config({ path: './config.env' });

const app = express();

app.set('view options', { layout: false });

app.use(cors());

app.use(express.static(__dirname + '/public'));

app.use(morgan('dev'));
app.use(express.json());

const DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => console.log('DB connection is successful.'));

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
    console.log(`Application running on port ${port}.`);
});

const deleteDB = async () => {
    try {
        const result = await StockModel.deleteMany({});
    } catch (err) {
        console.log(err);
    }
};

const getAndAddStockData = async (ticker, updateOnly) => {
    // From Rapid API's - Yahoo API selection: Limited to 5 request/sec
    // and 10,000 requests/month
    const options = {
        method: 'GET',
        url:
            'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary',
        params: { symbol: ticker, region: 'US' },
        headers: {
            'x-rapidapi-key': process.env.STOCK_API_KEY,
            'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);

        const symbol = ticker;
        const currentPrice = _.round(
            response.data.price.regularMarketPrice.raw,
            2
        );
        // FOR POST-MARKET PRICES
        // const currentPrice = _.round(
        //     response.data.price.postMarketPrice.raw,
        //     2
        // );
        const previousClose =
            response.data.price.regularMarketPreviousClose.raw;
        const companyName = response.data.price.longName;
        const companyWebSite = response.data.summaryProfile.website;

        const data = {
            symbol,
            currentPrice,
            previousClose,
            companyName,
            companyWebSite
        };

        if (!updateOnly) {
            await StockModel.create(data);
            console.log(`${ticker} added to DB`);
        }

        if (updateOnly) {
            await StockModel.findOneAndUpdate(
                { symbol: ticker },
                { currentPrice, previousClose }
            );
            console.log(`${ticker} quote updated`);
        }
    } catch (err) {
        console.log(`Error for: ${ticker}: `, err);
    }
};

const prePopulateDB = (stockList) => {
    // Since AlphaVantage's API let's us request 5 stock quotes
    // per second, we will split getting the info and adding it
    // to the DB into 2 groups (we are using 10 stocks), and
    // wait 6 seconds after the 1st group is complete.
    console.log('Getting stock info and adding to database...');

    try {
        for (let i = 0; i < 5; i++) {
            getAndAddStockData(stockList[i], false);
        }

        setTimeout(() => {
            for (let i = 5; i < stockList.length; i++) {
                getAndAddStockData(stockList[i], false);
            }
        }, 1000 * 6);
    } catch (err) {
        console.log(err);
    }
    console.log('Stock info added to database!');
};

const updateStockQuotes = (stockList) => {
    try {
        console.log('Updating Stocks...');

        // Get random subset from stocks list
        const randomStocks = [];
        randIdx = _.sampleSize([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 5);

        randIdx.forEach((element) => {
            randomStocks.push(stockList[element]);
        });

        randomStocks.forEach((stock) => {
            getAndAddStockData(stock, true);
        });
    } catch (err) {
        console.log(err);
    }
};

const updateStockQuotesLoop = (stockList, waitTime = 5) => {
    // Units of wait time is in seconds
    updateStockQuotes(stockList, true);
    setInterval(() => {
        updateStockQuotes(stockList, true);
    }, 1000 * waitTime);
};

app.get('/', function (req, res) {
    res.render('index.html');
});

app.use('/api/stocks', stockRouter);

stockList = [
    'MSFT',
    'AAPL',
    'DIS',
    'NVDA',
    'AMD',
    'TWLO',
    'AAL',
    'PLTR',
    'FCEL',
    'GME'
];

// deleteDB().then(() => {
//     console.log('Data deleted from DB.');
//     process.exit();
// });

//prePopulateDB(stockList);

updateStockQuotesLoop(stockList, (waitTime = 16));
