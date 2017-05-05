'use strict'
/**
 * @author Brandon Manke
 * @file script.js
 * @license MIT - unless otherwise specified, by 3rd party library/framework
 */
var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

(function() {
    setInterval(function() {
        displayDate();
    }, 1000);

    getLocation(function() {
        // GET request to darksky api every 10 minutes
        setInterval(getWeather(), 1000*60*10);
    });

    // News every 15 mins
    setInterval(getNews(), 1000*60*15);

    // Calendar Events every 15 mins
    setInterval(getCalendar(), 1000*60*15);
})(this);

function displayDate() {
    var date = new Date();
    var time = new Date().toLocaleString([], {   
        hour12: true,
        //weekday: 'long', 
        //year: 'numeric', 
        //month: 'long', 
        //day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        //timeZoneName: 'short'
    });
    var monthElement = document.getElementById('month');
    var dayElement = document.getElementById('day');
    var timeElement = document.getElementById('time');

    var weekday = days[date.getDay()];
    var day = date.getDate();
    var month = months[date.getMonth()];
    var year = date.getFullYear();

    monthElement.innerHTML = month + ' ' + day + ' ' + year;
    dayElement.innerHTML = weekday;
    timeElement.innerHTML = time + '';
}

function getLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            sendPosition(position, callback);
        }, function(errorCode) {
            callback();
        });
    } else {
        // if location is not supported
        console.log('Geolocation is not supported by this browser.');
        callback();
    }
}

function sendPosition(position, callback) {
    console.log(position);
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    var coords = { lat, long };
    var request = new XMLHttpRequest();
    request.open('POST', '/coord', true);
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    request.send(JSON.stringify(coords));
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            callback();
        }
        // otherwise error, then default value
    }
}

function getWeather() {
    var request = new XMLHttpRequest();
    request.open('GET', '/weather', true);
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            var data = JSON.parse(request.responseText);
            var response = JSON.parse(data.body);
            displayWeather(response);
        } else {
            console.log('something went very wrong :(', request.statusText);
        }
    };

    request.onerror = function() {
        console.log('error', request.statusText);
    };
    request.send();
}

function displayWeather(response) {
    var skycons = new Skycons({ 'color': 'white'});
    var temperature = document.getElementById('temp');
    var summary = document.getElementById('summary');
    temperature.innerHTML = Math.round(response.currently.temperature) + '° F';
    skycons.add('icon1', response.currently.icon);
    skycons.play();
    summary.innerHTML = response.hourly.summary;
}

function getNews() {
    var request = new XMLHttpRequest();
    request.open('GET', '/news', true);
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            var data = request.responseText;
            var rss = JSON.parse(data).body;
            displayNews(rss);
        } else {
            console.log('something went very wrong :(', request.statusText);
        }
    };

    request.onerror = function() {
        console.log('request error:', request.statusText);
    };
    request.send();
}

/**
 * Formats the news from xml string to text
 * @param {string} Associated Press rss feed in xml format
 */
function displayNews(xmlStr) {
    // formatting string to xml
    var parser = new DOMParser();
    var xml = parser.parseFromString(xmlStr, 'text/xml');
    var news = document.getElementById('news');
    for (var i = 0; i < news.childNodes.length; i++) {
        news.childNodes[i].innerHTML = xml.getElementsByTagName('title')[i].childNodes[0].nodeValue;
    }
}

/**
 * Gets 5 recent upcoming events from Google Calendar API
 */
function getCalendar() {
    var request = new XMLHttpRequest();
    request.open('GET', '/calendar', true);
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            var data = request.responseText;
            var events = JSON.parse(data);
            displayCalendar(events);
        } else {
            console.log('error:', request.status);
        }
    };

    request.onerror = function() {
        console.log('request error:', request.statusText);
    };
    request.send();
}

function displayCalendar(events) {
    console.log(events);
    if (events && events.length > 0) {
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var eventElement = document.createElement('li');
            var start = event.start.dateTime || event.start.date;
            var date = new Date(start);
            var eventText = document.createTextNode(months[date.getMonth()] + ' ' + 
                                                    date.getDate() + ' @ ' + 
                                                    date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' - ' + 
                                                    event.summary); // formates to [ date @ time - summary ]
            eventElement.appendChild(eventText);
            document.getElementById('calendar').appendChild(eventElement);
        }
    } else {
        var message = document.createElement('p');
        var text = document.createTextNode('No upcoming events found.');
        message.appendChild(text);
        document.getElementById('calendar').appendChild(message);
    }
}

