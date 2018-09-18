(function() {
  var placesAutocomplete = places({
    container: document.querySelector('#address-input'),
    aroundLatLngViaIP: false,
   
  });
})();

var bgArr = [
    "background1",
    "background2",
    "background3",
    "background4",
    "background5"
];

var randBG = bgArr[Math.floor(Math.random() * bgArr.length)];

$('.backgroundsettings').attr('id', randBG);