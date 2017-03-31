'use strict';
// Dark Sky API Key: 6cbf1a3b7c033fe32b72860130c53bb7
// html5 geolocation look into this for location settings
// NOTE: api json, hourly and daily are only interests currently
// https://github.com/plondon/BlackMirror
// ideas:
// https://github.com/ajwhite/MagicMirror/blob/master/components/weather.js
// https://atticuswhite.com/blog/react-native-smart-mirror-lab/
// https://developer.github.com/v3/activity/notifications/

// ICONS ARE MUST http://darkskyapp.github.io/skycons/

const express = require('express');
const request = require('request');
// const fs = require('fs'); probably dont even need fs but whatever

const app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.sendFile('index.html');
});

app.get('/weather', function(req, res) {
    const api = 'https://api.darksky.net/forecast/';
    const key = '6cbf1a3b7c033fe32b72860130c53bb7';
    const lat = '41.8781';
    const long = '-87.6298';
    let url = api + key + '/' + lat + ',' + long + '?exclude=minutely';
    request
        .get(url, function(err, body) {
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            //let temp = JSON.stringify(body);
            //console.log(JSON.parse(temp)); // this constructs a json from response body string
            res.write(JSON.stringify(body)); // must write to response header as string I believe?
            res.end();
        })
        .on('error', function(err) {
            console.log(err);
        });
});

app.listen(3000, function() {
	console.log('Express server started on localhost:3000');
});
