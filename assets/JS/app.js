// Define Constants
var WeatherAPIKey = "ff7593f8e0464608841e5c9dd3adfff5";

var todayDD = $("#today");
var tomorrowDD = $("#tomorrow");
var thisWeekDD = $("#this-week");
var thisWeekendDD = $("#this-weekend");
var nextWeekDD = $("#next-week");
var dateDD = $("#dropdownMenuButton");


// Define variables
var bgArr = [
  "background1",
  "background2",
  "background3",
  "background4",
  "background5"
];
var randBG = bgArr[Math.floor(Math.random() * bgArr.length)];

var searchTerm = "";
var searchLoc = "";
var searchRange = "";
var holdSearchLoc = "";

var hourWeatherData = null;
var dayWeatherData = null;
var eventData = null;

// Define Objects

var weather = {


  getBasicWeather: function (eventTime) {
    // eventTime formatted as 2018-09-23T08:00:00
    var eventStart = moment(eventTime, "YYYY-MM-DD hh:mm:ss");
    console.log("Event Start " + eventStart.format("MM/DD/YYYY hh:mm a"));
    var curTime = moment();
    var hourDiff = eventStart.diff(curTime, 'hours');
    var dayDiff = eventStart.diff(curTime, 'days');
    console.log("Diff " + hourDiff);
    var index = Math.floor(parseInt(hourDiff) / 3);
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

    if (index >= 0) {
      console.log(weatherData[index]);
      var iconImg = $("<img class='weather'>").attr("src", "https://www.weatherbit.io/static/img/icons/" + weatherData[index].weather.icon + ".png");
      iconImg.attr("alt", weatherData[index].weather.description);
      var tempP = $("<p>").text("Temp (F) " + weatherData[index].temp);
      var weatherDiv = $("<div>");
      weatherDiv.append(iconImg);
      weatherDiv.append(tempP);
      return weatherDiv;
    } else {
      var noWeather = $("<div>").text("Forecast not available yet.")
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
        hourWeatherData = response.data;
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
        dayWeatherData = response.data;
        console.log(dayWeatherData);
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

window.onscroll = function () { myFunction() };

var header = document.getElementById("myHeader");
var sticky = header.offsetTop;

function myFunction() {
  if (window.pageYOffset > sticky) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
}

$(todayDD).on("click", function () {
  $(dateDD).text("Today");
  $(dateDD).val("today");
});

$(tomorrowDD).on("click", function () {
  $(dateDD).text("Tomorrow");
  $(dateDD).val("tomorrow");
});

$(thisWeekDD).on("click", function () {
  $(dateDD).text("This Week");
  $(dateDD).val("this_week");
});

$(thisWeekendDD).on("click", function () {
  $(dateDD).text("This Weekend");
  $(dateDD).val("this_weekend");
});

$(nextWeekDD).on("click", function () {
  $(dateDD).text("Next Week");
  $(dateDD).val("next_week");
});

// Eventbrite API 
var searchEvents = function () {

  var queryURL = "https://www.eventbriteapi.com/v3/events/search/?token=FC6LKU64DWMREUUXI5CZ&&q=" + searchTerm + "&&location.address=" + searchLoc + "&&start_date.keyword=" + searchRange;

  // var queryURL = "https://www.eventbriteapi.com/v3/events/" + eventId +"/?token=FC6LKU64DWMREUUXI5CZ"
  // console.log(queryURL);

  $.ajax({

    url: queryURL,
    method: "GET"

  }).then(function (response) {
    console.log(response);
    eventData = response.events;

    buildResults();

  })

};


function SearchRestaurants() {
  var queryURL = "https://api.yelp.com/v3/businesses/search?location=new+brunswick+nj";

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
  })

};





function buildResults() {

  console.log("in buildResults");
  if (hourWeatherData == null || dayWeatherData == null || eventData == null) {
    return false;
  }
  console.log("We have all the data");

  // event for loop starts here-----

  for (i = 0; i < eventData.length; i++) {

    var eventName = (eventData[i].name.text);
    var eventStart = (eventData[i].start.local);
    var eventDescribe = (eventData[i].description.text);
    
    // moment.js for converting "2018-09-23T08:00:00"
    // var eventNewFormat = "Day, Month YYYY, h:mm am/pm";
    var startReformat = moment(eventStart).format("dddd, MMMM Do YYYY, h:mm a");

    // using .slice to get snippet of event description
    var eventSnippet = (eventDescribe.slice(0, 260) + "...");

    var eventWeather = $("<div class='col-2 weather'>").append(weather.getBasicWeather(eventStart));
    // compile event and weather data to write to DOM
    var eventInfo = "<div class ='col-7 col-md-6 event'> <h3 class= 'row'> <a href='event.html#eventid=" + eventId + "&&searchloc=" + searchLoc + "' target='_blank'>";
    eventInfo += eventName;
    eventInfo += "</a> </h3> <h2 class='row'>";
    eventInfo += startReformat;
    eventInfo += "</h2> <p class='row'>";
    eventInfo += eventSnippet;
    eventInfo += "</p> </div>";

    console.log(eventInfo)

    var eventImage = "";
    // CYA for missing event image
    if ((eventData[i].logo) == null) {
      eventImage = "https://via.placeholder.com/300x225?text=Sorry!+This+event+has+no+picture"
    } else {
      eventImage = (eventData[i].logo.original.url);
    }

    var imageRender = "<div class='col-3 col-md-4'> <img src= ";
    imageRender += eventImage;
    imageRender += " class=''> </div>";

    console.log(imageRender);

    var eventRender = $("<div class='row p-1 m-2'>").append(imageRender)
      .append(eventInfo).append(eventWeather);

    console.log(eventRender);

    $("#event-card").append(eventRender);
  };

};



$('.backgroundsettings').attr('id', randBG);

$("#eventSearch").on("click", function (event) {

  $("#event-card").empty();

  searchTerm = $("#event-input").val();
  searchLoc = $("#address-input").val();
  searchRange = $("#dropdownMenuButton").val();

  console.log(searchTerm);
  console.log(searchLoc);
  console.log(searchRange);

  if (searchLoc !== holdSearchLoc) {
    hourWeatherData = null;
    dayWeatherData = null;
    weather.search3hourWeather();
    weather.search1DayWeather();
  }
  eventData = null;
  searchEvents();
  holdSearchLoc = searchLoc;

  $("#event-input").val("");
  $("#address-input").val("");
  $(dateDD).text("Date Range");
  $(dateDD).val("");

});



