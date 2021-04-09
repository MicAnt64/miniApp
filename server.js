const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
    console.log(`Application running on port ${port}.`);
});
