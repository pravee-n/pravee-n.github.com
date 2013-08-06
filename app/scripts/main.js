var google = google || {};

var landingMapStyle = [{
    featureType: 'all',
    elementType: 'all',
    stylers: [ { visibility: 'on' }, { saturation: -100 }, { gamma: 1.94 } ]
}];




function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(-34.397, 150.644),
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        disableDoubleClickZoom: true,
        draggable : false,
        styles : landingMapStyle
    };
    google.maps.visualRefresh = true;
    var map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': 'India Gate, New Delhi' }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK ) {
            map.setCenter(results[0].geometry.location);
            map.fitBounds(results[0].geometry.viewport);
        }
    });
}

$( document ).ready( function() {
    google.maps.event.addDomListener( window, 'load', initialize );
});

