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
var searchTerm = "live music"
var searchLoc = "Rockaway, New Jersey, United States of America"


// Define Objects

var weather = {
  weatherData: null,
  searching: false,
  haveData: false,
  searchCity: "somerset,nj",
  searchZip: "08873",


  getDataByTime: function (eventTime) {

    var eventStart = moment(eventTime, "MM/DD/YYYY hh:mm a");
    console.log("Event Start " + eventStart.format("MM/DD/YYYY hh:mm a"));
    var curTime = moment();
    var hourDiff = eventStart.diff(curTime, 'hours');
    console.log("Diff " + hourDiff);
    var index = Math.floor(parseInt(hourDiff) / 3) + 1;
    console.log("Index " + index);

    if (this.haveData) {
      console.log(this.weatherData[index]);
      return this.weatherData[index];
    } else {
      return null;
    }
  },

  searchWeather: function (searchByZip) {
    var queryURL = "https://api.weatherbit.io/v2.0/forecast/3hourly?key=" + WeatherAPIKey + "&units=I";
    if (searchByZip) {
      queryURL += "&postal_code=" + this.searchZip + "&country=US";
    } else {
      queryURL += "&city=" + this.searchCity;
    }
    searching = true;
    $.ajax({
      url: queryURL,
      method: "GET"
    })
      .then(function (response) {
        this.weatherData = response.data;
        this.haveData = true;
        console.log(response);
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
    var eventName = (response.events[0].name.text);
    var eventStart = (response.events[0].start.local);
    var eventImage = (response.events[0].logo.original.url)

    // moment.js for converting "2018-09-23T08:00:00"
    // var eventNewFormat = "MM/DD/YY, hh:mm";
    var startReformat = moment(eventStart).format("dddd, MMMM Do YYYY, h:mm a");

    $("#event-card").text(eventName + ": " + startReformat);
    $("#event-image").attr("src", eventImage);


  })

};







$('.backgroundsettings').attr('id', randBG);

$("#eventSearch").on("click", function(event) {
  searchLoc = $("#address-input").val().trim();
  console.log(searchLoc);
  weather.searchCity=searchLoc;
  weather.searchWeather(false);
  searchEvents();

});



