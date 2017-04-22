/**
 * @author Brandon Manke
 * @file script.js
 * MIT License -- unless otherwise specified by framework or library
 */
var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

(function() {
    setInterval(function() {
        displayDate();
    }, 1000);

    // GET request to darksky api
    //getWeather();

})(this);

function displayDate() {
    var date = new Date();
    var time = new Date().toLocaleString([], 
        {   hour12: true, 
            //weekday: 'long', 
            //year: 'numeric', 
            //month: 'long', 
            //day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short'
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

function getWeather() {
    var request = new XMLHttpRequest();
    request.open('GET', '/weather', true);
    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            var data = JSON.parse(request.responseText);
        } else {
            console.log('something went very wrong :(', request.statusText);
        }
    };

    request.onerror = function() {
        console.log('error', request.statusText);
    }

    request.send();
}