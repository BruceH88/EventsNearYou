// define constants
var WeatherAPIKey = "ff7593f8e0464608841e5c9dd3adfff5";


// define variables
var searchLoc = "";
var eventId = "";

var hourWeatherData = null;
var dayWeatherData = null;
var eventData = null;
var restaurantData = null;

// Define Objects

var weather = {

  getBasicWeather: function (eventTime) {
    // eventTime formatted as 2018-09-23T08:00:00
    var eventStart = moment(eventTime, "YYYY-MM-DD hh:mm:ss");
    console.log("Event Start " + eventStart.format("MM/DD/YYYY hh:mm a"));
    var index = 0;
    var curTime = moment();
    var hourDiff = eventStart.diff(curTime, 'hours');
    var dayDiff = eventStart.diff(curTime, 'days');
    console.log("Diff " + hourDiff);
    if (hourDiff < 1) {
      index = 0;
    } else {
      index = Math.floor(parseInt(hourDiff) / 3);
    }
    console.log("Index " + index);
    var weatherData = null;
    if (index <= 40) {
      weatherData = hourWeatherData;
    } else {
      index = parseInt(dayDiff);
      console.log("Index " + index);
      weatherData = dayWeatherData;
      if (index > 16) {
        index = -1;
      }
    }
    console.log(weatherData);

    if (index >= 0 && index < weatherData.length) {
      console.log(weatherData[index]);
      var iconImg = $("<img class='weather'>").attr("src", "https://www.weatherbit.io/static/img/icons/" + weatherData[index].weather.icon + ".png");
      iconImg.attr("alt", weatherData[index].weather.description);
      var tempP = $("<p>").html(Math.round(weatherData[index].temp) + "° F");
      var weatherDiv = $("<div>");
      weatherDiv.append(iconImg);
      weatherDiv.append(tempP);
      return weatherDiv;
    } else {
      var noWeather = $("<div>").text("Forecast not available.")
      return noWeather;
    }

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
    restaurantData = response.businesses;
    buildResults();
  })

};

function buildResults() {

  console.log("in buildResults");
  if (hourWeatherData == null || dayWeatherData == null || eventData == null || restaurantData == null) {
    return false;
  }
  console.log("We have all the data");

  // EVENT BUILD
  var eventName = (eventData.name.text);
  var eventStart = (eventData.start.local);
  var eventEnd = (eventData.end.local);
  var eventDescribe = (eventData.description.text);

  var startDate = moment(eventStart).format("dddd, MMMM Do YYYY");
  var startTime = moment(eventStart).format("h:mm a");
  var endTime = moment(eventEnd).format("h:mm a");
  var eventTime = startTime + " - " + endTime;

  var eventImage = "";
    // CYA for missing event image
    if ((eventData.logo) == null) {
      eventImage = "https://via.placeholder.com/300x225?text=Sorry!+This+event+has+no+picture"
    } else {
      eventImage = (eventData.logo.original.url);
    }

  $('html head').find('title').text(eventName);
  $('#event-img').append("<img src='" + eventImage +"' class='img-fluid'>");
  $("#header").text(eventName);
  $("#event-date").text(startDate);
  $("#event-time").text(eventTime);
  $("#event-description").text(eventDescribe);

}


// define functions
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