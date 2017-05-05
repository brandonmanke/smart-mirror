'use strict';
/**
 * @author Brandon Manke
 * @file index.js
 * @license MIT - unless otherwise specified, by 3rd party library/framework
 */
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();

// Google calendar related imports
const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';
// End Calendar Related

// Coordinates default to Chicago
let lat = '41.8781';
let long = '-87.6298';

app.use(express.static(__dirname + '/src/public'));

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json 
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.sendFile('index.html');
});

/**
 * Gets weather info from Dark Sky API
 */
app.get('/weather', function(req, res) {
    const api = 'https://api.darksky.net/forecast/';
    const key = '6cbf1a3b7c033fe32b72860130c53bb7'; // This was my old api key, I reset this so people don't abuse it.
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

/**
 * Pulls upcoming events from google calendar after authorizing
 */
app.get('/calendar', function(req, res) {
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the
        // Google Calendar API.
        authorize(JSON.parse(content), function(auth) {
            listEvents(auth, function(events) {
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.write(JSON.stringify(events));
                res.end();
            });
        });
    });
});

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {function} callback function to send events object as response
 */
function listEvents(auth, callback) {
    // https://www.googleapis.com/calendar/v3/users/me/calendarList/calendarId
    const calendar = google.calendar('v3');
    calendar.events.list({
        auth: auth,
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 5,
        singleEvents: true,
        orderBy: 'startTime'
    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        const events = response.items;
        if (events.length == 0) {
            console.log('No upcoming events found.');
        } else {
            console.log('Upcoming 5 events:');
            for (let i = 0; i < events.length; i++) {
                let event = events[i];
                let start = event.start.dateTime || event.start.date;
                console.log('%s - %s', start, event.summary);
            }
        }
        callback(events);
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const auth = new googleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            //getNewToken(oauth2Client, callback);
            console.log('Error (probably need to generate new OAuth token)', err);
            return;
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Pulls RSS feed from Associated Press
 */
app.get('/news', function(req, res) {
    // Associated Press Top Stories RSS Feed
    const rss = 'http://hosted.ap.org/lineups/TOPHEADS.rss?SITE=AP&SECTION=HOME';
    request
        .get(rss, function(err, body) {
            if (err) {
                return console.log(err);
            }

            res.writeHead(200, {
                'Content-Type': 'text/xml'
            });

            res.write(JSON.stringify(body));
            res.end(); 
        });
});

/**
 * Receives coordinates from html5 geolocation
 */
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
