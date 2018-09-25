// define constants
var WeatherAPIKey = "ff7593f8e0464608841e5c9dd3adfff5";

var $htmlHead = $('html head');
var $eventImg = $('#event-img');
var $header = $("#header");
var $eventDate = $("#event-date");
var $eventTime = $("#event-time");
var $eventDesc = $("#event-description");
var $eventWeather = $("#event-weather");
var $ebriteURL = $("#ebrite-link");

// define variables
var searchLoc = "";
var eventId = "";

var hourWeatherData = null;
var dayWeatherData = null;
var eventData = null;
var foodData = null;

// Define Objects

var weather = {

  getEventWeather: function (startDateTime, endDateTime) {
    // eventTime formatted as 2018-09-23T08:00:00
    var eventStart = moment(startDateTime, "YYYY-MM-DD hh:mm:ss");
    console.log("Event Start " + eventStart.format("MM/DD/YYYY hh:mm a"));
    var eventEnd = moment(endDateTime, "YYYY-MM-DD hh:mm:ss");
    console.log("Event End " + eventEnd.format("MM/DD/YYYY hh:mm a"));
    var index = 0;
    var curTime = moment();
    var hourDiff = eventStart.diff(curTime, 'hours');
    var dayDiff = eventStart.diff(curTime, 'days');
    var hourDuration = true;
    var duration = eventEnd.diff(eventStart, 'hours');
    if (duration > 24) {
      hourDuration = false;
    }

    console.log("Diff " + hourDiff);
    if (hourDiff < 1) {
      index = 0;
    } else {
      index = Math.floor(parseInt(hourDiff) / 3);
    }
    console.log("Index " + index);
    var weatherData = null;
    if (index <= 40) {
      // use the hourly weather
      weatherData = hourWeatherData;
    } else {
      // use the daily weather and correct the index
      index = parseInt(dayDiff);
      console.log("Index " + index);
      weatherData = dayWeatherData;
      if (index > 16) {
        index = -1;
      }
    }
    console.log(weatherData);

    if (index >= 0 && index < weatherData.length) {
      // We have valid weather for the event date
      var count = 1;
      if (hourDuration) {
        // Event is for only a few hours
        $eventWeather.append(weather.createWeatherDiv(weatherData[index], false));
        count++;
      } else {
        // Event is for multile days
        while (duration > 0) {
          var daysDiv = weather.createWeatherDiv(weatherData[index], true);
          $eventWeather.append(daysDiv);
          duration -= 24;
          if (weatherData.length > 16) {
            // weatherData is the hourly data
            index += 8;
          } else {
            index++;
          }
          if (index >= weatherData.length - 1) {
            duration = -1;
          }
          count++;
        }
      }
      // blank out the other weather
      for (var i = count; i <= 6; i++) {
        var blankDiv = $("<div class='col-2'>");
        $eventWeather.prepend(blankDiv);
      }
    } else {
      // we did  not get the weather data or it is too far in the future
      var noWeather = $("<div>").text("Forecast not available.")
      $eventWeather.append(noWeather);
    }

  },

  createWeatherDiv: function (dataPoint, showDate) {
    console.log("Weather dataPoint");
    console.log(dataPoint);
    var iconImg = $("<img class='weather'>").attr("src", "https://www.weatherbit.io/static/img/icons/" + dataPoint.weather.icon + ".png");
    iconImg.attr("alt", dataPoint.weather.description);
    var tempP = $("<p>").html(Math.round(dataPoint.temp) + "° F");
    var weatherDiv = $("<div 'col-2'>");
    if (showDate) {
      var dateP = $("<p>").text(moment(dataPoint.datetime, "YYYY-MM-DD").format("MM/DD"));
      weatherDiv.append(dateP);
    }
    weatherDiv.append(iconImg);
    weatherDiv.append(tempP);
    return weatherDiv;
  },

  search3hourWeather: function () {
    var queryURL = "https://api.weatherbit.io/v2.0/forecast/3hourly?key=" + WeatherAPIKey + "&units=I&city=" + searchLoc;

    $.ajax({
      url: queryURL,
      method: "GET"
    })
      .then(function (response) {
        if (typeof response === "undefined") {
          hourWeatherData = [];
        } else {
          hourWeatherData = response.data;
        }
        console.log(hourWeatherData);
        buildResults();

      });
  },

  search1DayWeather: function () {
    var queryURL = "https://api.weatherbit.io/v2.0/forecast/daily?key=" + WeatherAPIKey + "&units=I&city=" + searchLoc;

    $.ajax({
      url: queryURL,
      method: "GET"
    })
      .then(function (response) {
        if (typeof response === "undefined") {
          dayWeatherData = [];
        } else {
          dayWeatherData = response.data;
        }
        console.log(dayWeatherData);
        buildResults();

      });
  },
};


// API functions
var getEventById = function () {

  var queryURL = "https://www.eventbriteapi.com/v3/events/" + eventId + "/?token=FC6LKU64DWMREUUXI5CZ";

  console.log(queryURL);

  $.ajax({

    url: queryURL,
    method: "GET"

  }).then(function (response) {
    console.log("Event");
    console.log(response);
    eventData = response;

    buildResults();

  })

};

function searchRestaurants() {
  var queryURL = "https://api.yelp.com/v3/businesses/search?location=" + searchLoc;

  var corsURL = "https://cors-anywhere.herokuapp.com/" + queryURL
  $.ajax({
    url: corsURL,
    method: "GET",
    headers: {
      'Authorization': "Bearer lhrYn5dCGekuwLnEd9gJ1XZI1Mr5EA-RXfMD-LDRQw6NsttLtGhcACHI6c9Psctt1talcXkzC2ZqF0vw4m8PqzcA4s9tQjESqhJG5eCLtUokgdGrgeKGH0tDCj2kW3Yx"
    }
  }).then(function (response) {
    console.log("Restaurants");
    console.log(response);
    foodData = response.businesses;
    buildResults();
  })

};

// define functions
function buildResults() {

  console.log("in buildResults");
  if (hourWeatherData == null || dayWeatherData == null || eventData == null || foodData == null) {
    return false;
  }
  console.log("We have all the data");

  // EVENT BUILD
  var eventName = (eventData.name.text);
  var eventStart = (eventData.start.local);
  var eventEnd = (eventData.end.local);
  var eventDescribe = (eventData.description.text);
  var eventURL = (eventData.url);

  var startDate = moment(eventStart).format("dddd, MMMM Do YYYY");
  var startTime = moment(eventStart).format("h:mm a");
  var endTime = moment(eventEnd).format("h:mm a");
  var eventTime = startTime + " - " + endTime;

  var eventImage = "";
  // CYA for missing event image
  if ((eventData.logo) == null) {
    eventImage = "https://dummyimage.com/300x225/FF9800/096cb2.png&text=This+event+has+no+image"
  } else {
    eventImage = (eventData.logo.original.url);
  }

  $htmlHead.find('title').html(eventName);
  $eventImg.append("<img src='" + eventImage + "' class='img-fluid rounded mx-auto img-thumbnail'>");
  $header.text(eventName);
  $eventDate.text(startDate);
  $eventTime.text(eventTime);
  $eventDesc.text(eventDescribe);
  weather.getEventWeather(eventStart,eventEnd);
  $ebriteURL.attr("href", eventURL);

  for (i = 0; i < 6; i++) {

    var foodName = (foodData[i].name);
    var foodImage = (foodData[i].image_url);
    var foodLinks = (foodData[i].alias);

    var foodDiv = $("#food-name-" + [i]);
    var foodImg = $("#food-img-" + [i]);
    var foodBtn = $("#food-link-" + [i]);

    foodDiv.text(foodName);
    foodImg.attr("src", foodImage);
    foodBtn.attr("href", "https://www.yelp.com/biz/" + foodLinks);
  }

}


function getHashParams() {
  var hashParams = {};
  var e,
    r = /([^&;=]+)=?([^&;]*)/g,
    q = window
      .location
      .hash
      .substring(1);
  while (e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}


$(document).ready(function () {

  var params = getHashParams();
  console.log(params);
  eventId = params.eventid;
  console.log(eventId);
  searchLoc = params.searchloc;
  console.log(searchLoc);

  weather.search3hourWeather();
  weather.search1DayWeather();
  getEventById();
  searchRestaurants();
});