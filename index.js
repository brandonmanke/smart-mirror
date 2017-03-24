// Dark Sky API Key: 6cbf1a3b7c033fe32b72860130c53bb7
// html5 geolocation look into this for locaiton settings
// NOTE: api json, hourly and daily are only interests currently

const express = require('express');
const request = require('request');
// const fs = require('fs'); probably dont even need fs but whatever

const app = express();
const api = 'https://api.darksky.net/forecast/6cbf1a3b7c033fe32b72860130c53bb7/41.8781,-87.6298';
const lat = 0;
const long = 0;

request
	.get(api, function(error, response, body) {
		console.log('error:', error);
		console.log('statusCode:', response && response.statusCode);
		console.log('body:', body);
  	})
	.on('error', function(error) {
		console.log(error);
	})
	.on('response', function(response) {
		console.log('status:', response.statusCode);
		//console.log(response.headers['content-type']);
	});


app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.sendFile('index.html');
});

app.listen(3000, function() {
	console.log('Express server started on localhost:3000');
});
