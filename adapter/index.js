'use strict';
// Constants
const cron = require('node-cron');
const assert = require('assert');
const mongoose = require('mongoose');
const fs = require('fs');
const request = require('request');

// Connection URL
const url = 'mongodb://root:example@db:27017/dataStore?authSource=admin';
let symbols = JSON.parse(fs.readFileSync('symbols.json', 'utf8'));
// console.log(symbols)
// Use mongoose method to connect to the Server
mongoose.connect(url, {useNewUrlParser: true});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('connected')
});
var symbolsSchema = new mongoose.Schema({
  _id:String,
  symbol: String,
  date: String,
  isEnabled: String,
  type: Boolean,
  iexId: String
});
for (var i = 0; i < symbols.length; i++) {
  console.log(symbols[i])
}

// compile schema to model
var symbolsMoldel = mongoose.model('symbols', symbolsSchema, 'symbolestore');

// save multiple documents to the collection referenced by Book Model
symbolsMoldel.collection.insertMany(symbols, function (err, docs) {
  if (err){ 
    return console.error(err);
  } else {
    // console.log("Multiple documents inserted to Collection");
  }
});

// on init, create create the symbols collection and load the symbols from symbols.json

// for each of the symbols make a rquest and get their time series and save to db

function getStockSeries(symbol='AAPL') {
  const httpOptions = {
    hostname: 'alphavantage.co',
    port: 443,
    path: '/query?function=TIME_SERIES_INTRADAY&symbol='+symbol+'&interval=5min&apikey=xx',
    method: 'GET'
  }

  request('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol='+symbol+'&interval=5min&apikey=xx', (error, response, body) => {
    console.error('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode);
    console.log('body:', JSON.parse(body) );
    let res = JSON.parse(body)['Time Series (5min)'];
    // console.log(res['Time Series (5min)'])
    let timeSeries = [];
    for (var event in res) {
      if (res.hasOwnProperty(event)) {
        let evt = res[event];
        evt['_id'] = event;
        timeSeries.push(evt);
      }
    }
    console.log(timeSeries);

  });
}

cron.schedule('*/10 * * * * *', () => {
  console.log('running a task every 10 Secs');
  getStockSeries()
});
