// Define Constants
var WeatherAPIKey = "ff7593f8e0464608841e5c9dd3adfff5";


// Define variables
var bgArr = [
  "background1",
  "background2",
  "background3",
  "background4",
  "background5"
];
var randBG = bgArr[Math.floor(Math.random() * bgArr.length)];
var searchTerm = "live music";
var searchLoc = "Rockaway, New Jersey, United States of America";

var weatherData = null;
var eventData = null;

// Define Objects

var weather = {


  getBasicWeather: function (eventTime) {
    // eventTime formatted as 2018-09-23T08:00:00
    var eventStart = moment(eventTime, "YYYY-MM-DD hh:mm:ss");
    console.log("Event Start " + eventStart.format("MM/DD/YYYY hh:mm a"));
    var curTime = moment();
    var hourDiff = eventStart.diff(curTime, 'hours');
    console.log("Diff " + hourDiff);
    var index = Math.floor(parseInt(hourDiff) / 3) + 1;
    console.log("Index " + index);
    if (index > 40) {
      index = index % 40;
    }
    console.log("Index " + index);

    console.log(weatherData[index]);
    var iconImg = $("<img>").attr("src", "https://www.weatherbit.io/static/img/icons/" + weatherData[index].weather.icon + ".png");
    iconImg.attr("alt", weatherData[index].weather.description);
    var tempP = $("<p>").text("Temp (F) " + weatherData[index].temp);
    var weatherDiv = $("<div>");
    weatherDiv.append(iconImg);
    weatherDiv.append(tempP);
    return weatherDiv;
  },

  searchWeather: function () {
    var queryURL = "https://api.weatherbit.io/v2.0/forecast/3hourly?key=" + WeatherAPIKey + "&units=I&city=" + searchLoc;

    $.ajax({
      url: queryURL,
      method: "GET"
    })
      .then(function (response) {
        weatherData = response.data;
        console.log(weatherData);
        buildResults();

      });
  },
};



// Define functions
(function () {
  var placesAutocomplete = places({
    container: document.querySelector('#address-input'),
    aroundLatLngViaIP: false,

  });
})();



// Eventbrite API 
var searchEvents = function () {

  var queryURL = "https://www.eventbriteapi.com/v3/events/search/?token=FC6LKU64DWMREUUXI5CZ&&q=" + searchTerm + "&&location.address=" + searchLoc;

  $.ajax({

    url: queryURL,
    method: "GET"

  }).then(function (response) {
    console.log(response);
    eventData = response.events;

    buildResults();
    // var eventName = (response.events[0].name.text);
    // var eventStart = (response.events[0].start.local);
    // var eventImage = (response.events[0].logo.original.url)

    // // moment.js for converting "2018-09-23T08:00:00"
    // // var eventNewFormat = "MM/DD/YY, hh:mm";
    // var startReformat = moment(eventStart).format("dddd, MMMM Do YYYY, h:mm a");

    // $("#event-card").text(eventName + ": " + startReformat);
    // $("#event-image").attr("src", eventImage);

    // $("#event-weather").append(weather.getBasicWeather(eventStart));
  })

};

function buildResults() {

  console.log("in buildResults");
  if (weatherData == null || eventData == null) {
    return false;
  }
  console.log("We have all the data");

  var eventName = (eventData[0].name.text);
  var eventStart = (eventData[0].start.local);
  var eventImage = (eventData[0].logo.original.url)

  // moment.js for converting "2018-09-23T08:00:00"
  // var eventNewFormat = "MM/DD/YY, hh:mm";
  var startReformat = moment(eventStart).format("dddd, MMMM Do YYYY, h:mm a");

  $("#event-card").text(eventName + ": " + startReformat);
  $("#event-image").attr("src", eventImage);

  $("#event-weather").append(weather.getBasicWeather(eventStart));

};



$('.backgroundsettings').attr('id', randBG);

$("#eventSearch").on("click", function (event) {
  searchLoc = $("#address-input").val().trim();
  console.log(searchLoc);
  weather.searchWeather();
  searchEvents();

});



