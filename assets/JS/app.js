// Define Constants
var WeatherAPIKey = "ff7593f8e0464608841e5c9dd3adfff5";

var todayDD = $("#today");
var tomorrowDD = $("#tomorrow");
var thisWeekDD = $("#this-week");
var thisWeekendDD = $("#this-weekend");
var nextWeekDD = $("#next-week");
var dateDD = $("#dropdownMenuButton");

var $eventInput = $("#event-input");
var $addressInput = $("#address-input");
var $eventCard = $("#event-card");

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
        var index = 0;
        var curTime;
        // Get the current utc time
        if (hourWeatherData.length > 0) {
            curTime = moment(hourWeatherData[0].timestamp_utc, "YYYY-MM-DD hh:mm:ss");
        } else {
            curTime = moment().add(20, 'days');
        }
        // determine the time offset so we can display the correct weather
        var hourDiff = eventStart.diff(curTime, 'hours');
        var dayDiff = eventStart.diff(curTime, 'days');

        if (hourDiff < 1) {
            index = 0;
        } else {
            index = Math.floor(parseInt(hourDiff) / 3);
        }
        var weatherData = null;
        // determine if we use the hour weather or day weather
        if (index <= 40) {
            weatherData = hourWeatherData;
        } else {
            index = parseInt(dayDiff);
            weatherData = dayWeatherData;
            if (index > 16) {
                // event is beyond the weather we have
                index = -1;
            }
        }

        if (index >= 0 && index < weatherData.length) {
            var iconImg = $("<img class='img-fluid weatherIcon'>").attr("src", "https://www.weatherbit.io/static/img/icons/" + weatherData[index].weather.icon + ".png");
            iconImg.attr("alt", weatherData[index].weather.description);
            var tempP = $("<p>").text(Math.round(weatherData[index].temp) + "° F");
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

$(document).ready(function () {
    $("#event-card").hide();
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
        eventData = response.events;

        buildResults();

    })

};



function buildResults() {

    if (hourWeatherData == null || dayWeatherData == null || eventData == null) {
        return false;
    }

    // event for loop starts here-----
    for (i = 0; i < eventData.length; i++) {
        console.log(eventData[i]);
        var eventName = (eventData[i].name.text);
        var eventStart = (eventData[i].start.local);
        var eventDescribe = (eventData[i].description.text);
        var eventId = (eventData[i].id);

        // moment.js for converting "2018-09-23T08:00:00"
        // var eventNewFormat = "Day, Month YYYY, h:mm am/pm";
        var startDate = moment(eventStart).format("dddd, MMMM Do YYYY,");
        var startTime = moment(eventStart).format("h:mm a");
        var eventSnippet = "";
        // using .slice to get snippet of event description
        if (eventDescribe === null) {
            eventSnippet = "No description available."
        } else if (eventDescribe.length > 260) {
            eventSnippet = (eventDescribe.slice(0, 260) + "...");
        } else {
            eventSnippet = eventDescribe;
        }

        var eventWeather = $("<div class='col-12 col-sm-5 col-md-2 weather mx-auto text-center'>").append(weather.getBasicWeather(eventData[i].start.utc));

        var eventInfo = "<div class ='col-7 col-md-6 mx-auto event'> <h2 class= 'row'> <a href='event.html#eventid=" + eventId + "&&searchloc=" + searchLoc + "' target='_blank'>";
        eventInfo += eventName;
        eventInfo += "</a> </h2> <h3 class='row'>";
        eventInfo += startDate + " @" + startTime;
        eventInfo += "</h3> <p class='row'>";
        eventInfo += eventSnippet;
        eventInfo += "</p> </div>";

        var eventImage = "";
        // CYA for missing event image
        if ((eventData[i].logo) == null) {
            eventImage = "https://dummyimage.com/300x255/000000/fff.png&text=Sorry!+This+event+has+no+image"
        } else {
            eventImage = (eventData[i].logo.original.url);
        }

        var imageRender = "<div class='col-12 col-lg-3 my-3 mx-auto'> <img src= ";
        imageRender += eventImage;
        imageRender += " class='img-fluid event-img'> </div>";

        if ((eventData.length) === 0) {

            console.log("No events available!");

        } else {

            var eventRender = $("<div class='row p-1 m-2 border-bottom'>").append(imageRender)
                .append(eventInfo).append(eventWeather);

            $eventCard.append(eventRender);

        };
    };
    $("#event-card").show();
    if (i === 0) {
        $eventCard.text("No events found.");
    }

};


$('.backgroundsettings').attr('id', randBG);

$("#eventSearch").on("click", function (event) {

    $eventCard.empty();

    searchTerm = $eventInput.val();
    searchLoc = $addressInput.val();
    if (searchLoc === "New York, United States of America") {
        searchLoc = "New York, New York, United States of America"
    }
    searchRange = dateDD.val();

    if (searchLoc !== holdSearchLoc) {
        hourWeatherData = null;
        dayWeatherData = null;
        weather.search3hourWeather();
        weather.search1DayWeather();
    }
    eventData = null;
    searchEvents();
    holdSearchLoc = searchLoc;

    $eventInput.val("");
    $addressInput.val("");
    dateDD.text("Date Range");
    dateDD.val("");

});

todayDD.on("click", function () {
    dateDD.text("Today");
    dateDD.val("today");
});

tomorrowDD.on("click", function () {
    dateDD.text("Tomorrow");
    dateDD.val("tomorrow");
});

thisWeekDD.on("click", function () {
    dateDD.text("This Week");
    dateDD.val("this_week");
});

thisWeekendDD.on("click", function () {
    dateDD.text("This Weekend");
    dateDD.val("this_weekend");
});

nextWeekDD.on("click", function () {
    dateDD.text("Next Week");
    dateDD.val("next_week");
});

