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