let autocomplete;
function initMap() {
        let mapOptions = {center: {lat: 1.3483, lng: 103.6831},
            zoom: 15};
        var map = new google.maps.Map(document.getElementById('map'), mapOptions);
        var input = document.getElementById('search_term');

        autocomplete = new google.maps.places.Autocomplete(input,{
        types: ['establishment'],
        componentRestrictions: {'country': ['SG']},
        fields: ['place_id', 'geometry', 'name']
    });
        // Linking startuppage search result to mappage
        var tempitem = sessionStorage.getItem("locationmarker");
    
        if (tempitem != null) {
            sessionStorage.clear();
            var searchresult = JSON.parse(tempitem);
            map.panTo(new google.maps.Marker({
                position: searchresult.geometry.location,
                title: searchresult.name,
                map: map
            }).position);
        } 
}
