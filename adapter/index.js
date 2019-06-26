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
mongoose.Promise = global.Promise;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected')
});

// DataBase Schemas
// symbols
var symbolsSchema = new mongoose.Schema({
  _id:String,
  symbol: String,
  date: String,
  isEnabled: String,
  type: Boolean,
  iexId: String
});

// time Series
var seriesSchema = new mongoose.Schema({
  _id:String,
  open: String,
  close: String,
  low: String,
  high: String,
  volume: String,
  symbol: String,
  iTime: String
});

// compile schema to model
var symbolsMoldel = mongoose.model('symbols', symbolsSchema, 'symbolestore');
var seriesMoldel = mongoose.model('series', seriesSchema, 'seriesstore');

// save all symbols to the collection
symbolsMoldel.collection.insertMany(symbols, function (err, docs) {
  if (err){ 
    return console.error(err);
  } else {
    console.log("documents inserted");
  }
});


// get stock time series for a given symbol
function getStockSeries(symbol='AAPL') {

  request('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol='+symbol+'&interval=5min&apikey=xxq', (error, response, body) => {
    console.error('error:', error); // Print the error if one occurred
    let res = JSON.parse(body)['Time Series (5min)'];
    let timeSeries = [];
    for (var event in res) {
      if (res.hasOwnProperty(event)) {
        let evt = res[event];
        evt['_id'] = event+symbol;
        evt['low'] = evt['3. low'];
        evt['high'] = evt['2. high'];
        evt['open'] = evt['1. open'];
        evt['close'] = evt['4. close'];
        evt['iTime'] = event;
        evt['volume'] = evt['5. volume'];
        evt['symbol'] = symbol;

        delete evt['3. low']
        delete evt['2. high']
        delete evt['4. close']
        delete evt['5. volume']
        delete evt['1. open']
        timeSeries.push(evt);
      }
    }
    console.log(timeSeries);    
    // save all timeSeries to the collection
    seriesMoldel.collection.insertMany(timeSeries, { ordered: false }, function (err, docs) {
      if (err){ 
        return console.error(err);
      } else {
        console.log("documents inserted");
        return true;
      }
    });

  });
}

cron.schedule('*/45 * * * * *', () => { 
  // This schedues a 45 seconds ( IDEAL '*/5 * * * *'==> for five mins Interval since source refreshes after 5 mins )
  console.log('running a task every 10 Secs');
  for (var i = 0; i < symbols.length; i++) {
    let symbol = symbols[i]['symbol'];
    // console.log(symbol);
    getStockSeries(symbol);
  }
});
