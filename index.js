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

// TODOS: Google News, Google Calendar, & possibly github feed or something

// https://www.googleapis.com/calendar/v3/users/me/calendarList/calendarId

const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
//const fs = require('fs'); //probably dont even need fs but whatever

const app = express();

// coordinates default to Chicago
let lat = '41.8781';
let long = '-87.6298';

app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json 
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.sendFile('index.html');
});

app.get('/weather', function(req, res) {
    const api = 'https://api.darksky.net/forecast/';
    const key = '6cbf1a3b7c033fe32b72860130c53bb7';
    //console.log('Getting weather');
    const url = api + key + '/' + lat + ',' + long + '?exclude=minutely';
    console.log(url,'\n');
    request
        .get(url, function(err, body) {
            if (err) {
                return console.log(err);
            }

            res.writeHead(200, {
                'Content-Type': 'application/json'
            });

            //console.log(JSON.parse(temp)); // this constructs a json from response body string
            res.write(JSON.stringify(body)); // must write to response header as string I believe?
            res.end();
        });
});

app.get('/calendar', function(req, res) {
    //const
});

app.post('/coord', function(req, res) {
    //req.body.Geopostion.coords.latitude;
    if (!req.body) {
        return res.sendStatus(400);
    }
    lat = req.body.lat;
    long = req.body.long;
    res.sendStatus(200);
});

app.listen(3000, function() {
	console.log('Express server started on localhost:3000');
});
