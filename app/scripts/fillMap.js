var FillMap = function( map, data ) {

    var mapInstance, rawData, currentData, currentStores, infoBoxHandler, currentZoom, defaultCluster, currentCluster;
    var log = bows( 'fillMap' );

    var messages = {
        initialized      : 'New Fill Map instance initialized',
        noMap            : 'Map instance not provided',
        noData           : 'Data not provided, or does not contain the required parameters',
        foundData        : 'Received and set data',
        generatedCluster : 'generated cluster for the given points',
        noStores         : 'stores parameter not found in the provided data',
        showStoreInfo    : 'show store info handler called'
    };

    var mapDom = {
        map : {
            mapContainer : '.js-map-container',
            mapCanvas    : '.js-map-canvas'
        },
        mapMenu : {
            container : '.js-control-bar-container',
            zoomIn    : '.js-control-bar-zoomIn',
            zoomOut   : '.js-control-bar-zoomOut',
            filter    : '.js-control-bar-filter',
            shortlist : '.js-control-bar-shortlist'
        }
    };

    var statusColors = {
        available : {
            color  : '#5cb85c'
        },
        notAvailable : {
            color  : '#d9534f'
        },
        noInfo : {
            color  : '#ffc000'
        }
    };


    /**
     * initialize the map menu with click handlers
     */
    function initializeMapMenu() {
        $( mapDom.mapMenu.zoomIn ).on( 'click', function() {
            log( 'zoom called' );
            currentZoom = mapInstance.getZoom();
            mapInstance.setZoom( currentZoom + 1 );
            currentZoom++;
        });

        $( mapDom.mapMenu.zoomOut ).on( 'click', function() {
            log( 'zoom out called' );
            currentZoom = mapInstance.getZoom();
            mapInstance.setZoom( currentZoom - 1 );
            currentZoom--;
        });

        $( mapDom.mapMenu.shortlist ).on( 'click', function() {
            showShortlist();
        });
    }

    function showShortlist() {
        defaultCluster.clearMarkers();
        var shorlistedMarkers = YShortlist.getList();
        log( shorlistedMarkers );
        var shortlistedCluster = new MarkerClusterer( mapInstance, shorlistedMarkers, {
            maxZoom: 11
        });
    }



    /**
     * generate clusters from the current store data
     */
    function generateClusters () {
        var markers = buildMarkers( currentStores );
        var markerCluster = new MarkerClusterer( mapInstance, markers, {
            maxZoom : 11
        } );
        defaultCluster= markerCluster;
        currentUserPosition = defaultCluster;
        getUserLocation();
    }

    /**
     * get current user location and call the generate circle function
     */
    function getUserLocation() {
        navigator.geolocation.getCurrentPosition( generateDistanceCircle );
    }


    /**
     * generate draggable circle for user.
     * @param  {HTML5 geolocation OBject } userLocation [description]
     */
    function generateDistanceCircle ( userLocation ) {

        mapInstance.panTo( new google.maps.LatLng( userLocation.coords.latitude, userLocation.coords.longitude ) );
        mapInstance.setZoom( 12 );

        var marker = new google.maps.Marker({
            map       : mapInstance,
            position  : new google.maps.LatLng( userLocation.coords.latitude, userLocation.coords.longitude ),
            draggable : true,
            title     : 'Drag me!',
            icon      : {
                path          : fontawesome.markers.HOME,
                scale         : 0.015,
                strokeWeight  : 0,
                strokeColor   : '#5bc0de',
                strokeOpacity : 1,
                fillColor     : '#5bc0de',
                fillOpacity   : 1,
                rotation      : 180
            }
        });

        EYS.currentUserPosition = marker;


        var circle = new google.maps.Circle({
            map          : mapInstance,
            radius       : 10000,
            fillColor    : '#666666',
            fillOpacity  : 0.07,
            strokeColor  : '#ffb600',
            strokeWeight : 2,
            suppressUndo : true
        });

        circle.setEditable( true );
        circle.bindTo( 'center', marker, 'position' );
    }


    /**
     * process raw data
     */
    function processData() {
        if ( rawData ) {
            currentStores = rawData;
            generateClusters();
        }
    }

    /**
     * shows store info on the info container and pans the map to accomodate the info box
     * @param  {Object} event Google maps click event
     */
    function showStoreInfo( event ) {
        var pointer = this;
        var infoBox = mapDom.storeInfo;

        var bounds = mapInstance.getBounds();
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        var userPosition = EYS.currentUserPosition.getPosition();

        var pointerPosition = pointer.getPosition();
        var userLeft = pointerPosition.lng();
        var userTop = pointerPosition.lat();
        var mapDistance = Math.abs( sw.lng() - ne.lng() );
        var newPan = userLeft + 0.2 * mapDistance ;
        var newMapPosition = new google.maps.LatLng( userTop ,newPan );

        infoBoxHandler.update( pointer, userPosition );

        // mapInstance.panTo( newMapPosition );

    }


    /**
     * get the default marker settings for the store marker
     * @return {Object} Object containing the default marker settings
     */
    function getDefaultMarkerSettings() {
        return {
            animation : 'DROP',
            flat      : true,
            icon: {
                path: fontawesome.markers.PUSHPIN,
                scale: 0.012,
                strokeWeight: 0,
                strokeColor: '#ffc000',
                strokeOpacity: 1,
                fillColor: '#fbff9a',
                fillOpacity: 1,
                rotation: 180
            }
        };
    };

    /**
     * build a markers array.
     * @param  Object data  Data containing markers' data
     * @return Object       Array containing objects as markers
     */
    function buildMarkers( data ) {
        var log = bows( 'buildMarkers' );
        log( data );
        markersToReturn = [];
        if ( data ) {
            log ( 'Building Markers from the data provided' );
            var dataLength = data.length;
            for ( var dataKey in data ) {
                var currentSet = data[ dataKey ];
                log( currentSet );
                var latitude = currentSet.latitude;
                var longitude = currentSet.longitude;
                var markerLocation = new google.maps.LatLng( latitude,longitude );
                var currentMarkerSettings = getDefaultMarkerSettings();

                // adding information to the markers
                currentMarkerSettings.position = markerLocation;
                currentMarkerSettings.YAbout   = currentSet.about;
                currentMarkerSettings.YAddress = currentSet.address;
                currentMarkerSettings.YName    = currentSet.name;
                currentMarkerSettings.YId      = currentSet.id;
                currentMarkerSettings.YPhone   = currentSet.phone;
                currentMarkerSettings.YPicture = currentSet.picture;
                currentMarkerSettings.YPrice   = currentSet.price;
                log( currentMarkerSettings.YPrice );

                var randomStatus = parseInt( ( Math.random() * 3 ), 10 );
                currentMarkerSettings.YStatus = randomStatus;
                // log( "status:"+currentMarkerSettings.YStatus );


                if ( randomStatus === 0 ) {
                    currentMarkerSettings.icon.strokeColor = statusColors.available.color;
                    currentMarkerSettings.icon.fillColor = statusColors.available.color;
                } else if ( randomStatus === 1 ) {
                    currentMarkerSettings.icon.fillColor = statusColors.notAvailable.color;
                    currentMarkerSettings.icon.strokeColor = statusColors.notAvailable.color;
                } else if ( randomStatus === 2 ) {
                    currentMarkerSettings.icon.fillColor = statusColors.noInfo.color;
                    currentMarkerSettings.icon.strokeColor = statusColors.noInfo.color;
                } else {
                    currentMarkerSettings.icon.fillColor = statusColors.noInfo.color;
                    currentMarkerSettings.icon.strokeColor = statusColors.noInfo.color;
                }
                // log( "strokecolor:"+currentMarkerSettings.icon.strokeColor );
                // log( "fillcolor:"+currentMarkerSettings.icon.fillColor );


                var marker = new google.maps.Marker( currentMarkerSettings );
                var listener = google.maps.event.addListener(marker, 'click', showStoreInfo );
                markersToReturn.push( marker );
            }
            return markersToReturn;
        } else {
            log ( 'data not provided. Can not build markers' );
        }
    }



    /**
     * initialization function. SELF CALLING
     */
    (function init() {
        log( messages.initialized );
        if ( map ) {
            if ( data ) {
                mapInstance = map;
                infoBoxHandler = new infoContainerHandler( mapInstance );
                initializeMapMenu();
                rawData = data;
                processData();
            } else {
                log( messages.noData );
            }
        } else {
            log( messages.noMap );
        }

    })();
};
