var google = google || {};

var landingController = ( function(){

    var mapInstance,
        locationHandler,
        animationStep,
        infoBubble,
        marker,
        currentUserLocation,
        animationMarkers,
        animationBubbles;

    var log = bows( 'landingController' );

    var messages = {
        mapLoad : 'Map Loaded'
    };

    var landingMapStyle = [{
        featureType: 'all',
        elementType: 'all',
        stylers: [ { visibility: 'on' }, { saturation: -100 }, { gamma: 1.94 } ]
    }];

    /**
     * Example Data to be shown on the landing page
     * @type {Array}
     */
    var exampleData = [
        [
            {
                name : 'Reliance Trends',
                lattitude : 1,
                longtidue : 2
            },
            {
                name : 'Radix Technologies',
                lattitude : 1,
                longtidue : 2
            },
            {
                name : 'Jumbo Electronics',
                lattitude : 1,
                longtidue : 2
            }
        ],
        [
            {
                name : 'Reliance Trends',
                lattitude : 1,
                longtidue : 2
            },
            {
                name : 'Radix Technologies',
                lattitude : 1,
                longtidue : 2
            },
            {
                name : 'Jumbo Electronics',
                lattitude : 1,
                longtidue : 2
            }
        ],
        [
            {
                name : 'Reliance Trends',
                lattitude : 1,
                longtidue : 2
            },
            {
                name : 'Radix Technologies',
                lattitude : 1,
                longtidue : 2
            },
            {
                name : 'Jumbo Electronics',
                lattitude : 1,
                longtidue : 2
            }
        ],
        [
            {
                name : 'Reliance Trends',
                lattitude : 1,
                longtidue : 2
            },
            {
                name : 'Radix Technologies',
                lattitude : 1,
                longtidue : 2
            },
            {
                name : 'Jumbo Electronics',
                lattitude : 1,
                longtidue : 2
            }
        ],
        [
            {
                name : 'Reliance Trends',
                lattitude : 1,
                longtidue : 2
            },
            {
                name : 'Radix Technologies',
                lattitude : 1,
                longtidue : 2
            },
            {
                name : 'Jumbo Electronics',
                lattitude : 1,
                longtidue : 2
            }
        ]
    ];

    // DEFINING THE SETTINGS VARIABLE
    var settings = {
        mapStyle : landingMapStyle,
        mapCenterAddress : 'India Gate, New Delhi',
        mapContainer     : 'map-canvas',
        filterDataUrl    : '/scripts/filter.json'
    };

    /**
     * Initialize Map on the page.
     */
    function initializeMap() {
        var mapOptions = {
            center           : new google.maps.LatLng(-34.397, 150.644),
            zoom             : 13,
            mapTypeId        : google.maps.MapTypeId.ROADMAP,
            styles           : settings.mapStyle,
            disableDefaultUI : true,
            scrollwheel      : false
        };
        google.maps.visualRefresh = true;
        mapInstance = new google.maps.Map( document.getElementById( settings.mapContainer ),mapOptions );
        log( messages.mapLoad );
    }

    /**
     * Get data of a single product object.
     */
    function getData() {
        mainData.getProductObject( 1, initializeProductHandler );
    }

    /**
     * Start the animation of the page
     */
    function startAnimation() {
        animationStep++;
        if ( animationStep === 6 ) {
            $( '.lnd-rotate-item.item' + ( animationStep-1 ) ).removeClass( 'active' );
            animationStep = 1;
        }
        $( '.lnd-rotate-item.item' + ( animationStep-1 ) ).removeClass( 'active' );
        $( '.lnd-rotate-item.item' + animationStep  ).addClass( 'active' );

        var currentStoresData = exampleData[ animationStep - 1 ];

        for( var item in animationMarkers ) {
            var marker = animationMarkers[ item ];
            marker.setMap( null );
        }

        for( var item in animationBubbles ) {
            var bubble = animationBubbles[ item ];
            bubble.close();
        }

        for( var item in currentStoresData ) {
            var store = currentStoresData[ item ];
            log( store );
            var storeName = store.name;
            var currentLat = currentUserLocation.lat() + Math.random()*0.07;
            var currentLon = currentUserLocation.lng() - Math.random()*0.07;
            var location = new google.maps.LatLng( currentLat, currentLon );
            var marker = new google.maps.Marker({
                map       : mapInstance,
                position  : location,
                draggable : false,
                icon      : {
                    path          : fontawesome.markers.CIRCLE,
                    scale         : 0.011,
                    strokeWeight  : 1,
                    strokeColor   : '#42b8e9',
                    strokeOpacity : 1,
                    fillColor     : '#42b8e9',
                    fillOpacity   : 0.75,
                    rotation      : 45
                }
            });
            animationMarkers.push( marker );
            var settings = getLabelSettings();
            var label = new InfoBubble( settings );
            label.content = '<div class="landing-store-label">' + storeName + '</div>';
            // infoBubble.position = location;
            label.open( mapInstance, marker );
            animationBubbles.push( label );
        }
        setTimeout( startAnimation, 5000);
    }


    /**
     * Get the settings for the home icon/bubble.
     * @return {Object} InfoBubble Object
     */
    function getInfoBubbleSettings() {

        return {
            map: mapInstance,
            content: '<div class="landing-home-bubble-inner"><i class="icon-home"></i></div>',
            shadowStyle: 0,
            padding: 0,
            backgroundColor: 'rgba(233,90,90,0.85)',
            borderRadius: 4,
            arrowSize: 10,
            borderWidth: 0,
            borderColor: '#e95a5a',
            disableAutoPan: true,
            hideCloseButton: true,
            arrowPosition: 50,
            backgroundClassName: 'landing-home-bubble',
            arrowStyle: 0,
            minWidth : 30
        };
    }


    /**
     * Get settings for the infoBubbles used to show the stores on landing
     * @return {Object} Infobubble settings
     */
    function getLabelSettings() {

        return {
            map: mapInstance,
            content: '<div class="landing-home-bubble-inner"><i class="icon-home"></i></div>',
            shadowStyle: 0,
            padding: 0,
            backgroundColor: 'rgba(66,184,233,0.85)',
            borderRadius: 4,
            arrowSize: 10,
            borderWidth: 0,
            borderColor: '#e95a5a',
            disableAutoPan: true,
            hideCloseButton: true,
            arrowPosition: 50,
            backgroundClassName: 'landing-home-bubble',
            arrowStyle: 0,
            minWidth : 150,
            minHeight : 'none'
        };
    }


    /**
     * Set the center of the map based on the Geolocation
     * @param {Object} userLocation HTML5 GeoLocation Object
     */
    function setMapCenter( userLocation ) {
        var location = new google.maps.LatLng( userLocation.coords.latitude, userLocation.coords.longitude );
        currentUserLocation = location;
        mapInstance.setCenter( location );
        marker = new google.maps.Marker({
            map       : mapInstance,
            position  : location,
            draggable : true,
            title     : 'Drag me!',
            icon      : {
                path          : fontawesome.markers.CIRCLE,
                scale         : 0.011,
                strokeWeight  : 1,
                strokeColor   : '#e95a5a',
                strokeOpacity : 1,
                fillColor     : '#e95a5a',
                fillOpacity   : 0.75,
                rotation      : 45
            }
        });

        locationHandler.codePosition( location, updateAddress );
        var settings = getInfoBubbleSettings();
        infoBubble = new InfoBubble( settings );
        // infoBubble.position = location;
        infoBubble.open( mapInstance, marker );
        startAnimation();
    }

    /**
     * Update the address on the page when the marker is dragged
     * @param  {[type]} address Address
     */
    function updateAddress( address ) {
        $( '.lnd-location-input' ).val( address );
    }

    /**
     * Update position when the user provides a location
     * @param  {Object} location Location
     */
    function updatePosition( location ) {
        mapInstance.panTo( location );
        infoBubble.close();
        infoBubble.position = location;
        infoBubble.open( mapInstance );
        marker.setPosition( location );
        currentUserLocation = location;
    }

    /**
     * Bind various DOM events
     */
    function bindEvents() {
        $( '.lnd-location-button' ).on( 'click', function() {
            var address = $( '.lnd-location-input' ).val();
            locationHandler.codeAddress( address, updatePosition );
        });
    }

    /**
     * initialize the search view Controller
     */
    function init() {
        initializeMap();
        bindEvents();
        locationHandler = new locationModule();
        locationHandler.detectLocation( setMapCenter );
        animationStep = 0;
        animationMarkers = [];
        animationBubbles = [];
    }

    return {
        init : init
    };

})();


$( document ).ready( function() {
    analytics.pageview();
    google.maps.event.addDomListener( window, 'load', landingController.init() );
});

