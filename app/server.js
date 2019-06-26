'use strict';

const express = require('express');
const mongoose = require('mongoose');

// Connection URL
const url = 'mongodb://root:example@db:27017/dataStore?authSource=admin';
// Database Name
const dbName = 'dataStore';
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

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
// App 
const app = express();


app.get('/', (req, res) => {
	res.send('Welcome \n');
});


app.get('/symbols', (req, res) => {
	symbolsMoldel.find({}).exec(function(err, symbols){
		res.send(symbols);
	});
});

app.get('/series/:symbol', (req, res) => {
	seriesMoldel.find({symbol:req.params.symbol}).limit(30).exec(function(err, series){
		res.send(series);
	});
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);