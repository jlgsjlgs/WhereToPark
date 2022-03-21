let autocomplete;

function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("input"),
    {
        types: ['establishment'],
        componentRestrictions: {'country': ['SG']},
        fields: ['place_id', 'geometry', 'name']
    });
}

function specificSearching() {
    var place = autocomplete.getPlace();
    sessionStorage.setItem("locationmarker", JSON.stringify(place));
    window.location.href = './mappage.html';
}

function getLocation() {
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(storeLocation(), showError());
        window.location.href = './mappage.html';
    } else {
        alert("Sorry! Your browser does not support Geolocation API");
    }
}

function storeLocation(position) {
    sessionStorage.setItem("userlocation", {lat: position.coords.latitude, lng: position.coords.longitude})
}

function showError() {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation API");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("User location information is unavailable");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error has occurred");
            break;
    }
}

window.onload=function(){
    document.getElementById("testbutton").addEventListener("click", specificSearching);
};