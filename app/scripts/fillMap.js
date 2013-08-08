var FillMap = function( map, data ) {

    // Declaring all the variables to be used by this module.
    var mapInstance, rawData, currentData, currentStores, infoBoxHandler, currentZoom, defaultCluster, currentCluster, currentCircle, currentClusterCount, currentClusterInfobubbles;
    var log = bows( 'fillMap' );

    /**
     * Logging messages for this module
     * @type {Object}
     */
    var messages = {
        initialized      : 'New Fill Map instance initialized',
        noMap            : 'Map instance not provided',
        noData           : 'Data not provided, or does not contain the required parameters',
        foundData        : 'Received and set data',
        generatedCluster : 'generated cluster for the given points',
        noStores         : 'stores parameter not found in the provided data',
        showStoreInfo    : 'show store info handler called'
    };

    /**
     * Contains all DOM references to be used by this module.
     * @type {Object}
     */
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
        },
        globalSearch : {
            locationDropdown    : '.js-location-dropdown',
            container           : '.js-global-search-container',
            searchInput         : '.js-main-search-input',
            locationLabel       : '.js-location-label',
            locationContainer   : '.js-location-container',
            locationAuto        : '.js-location-autodetect',
            locationUpdate      : '.js-update-location-button',
            locationInput       : '.js-search-location',
            locationIconMain    : '.js-search-location-icon-main',
            locationIconLoading : '.js-search-location-icon-loading'
        }
    };

    /**
     * Colors of the markers - 4 colors for statu
     * @type {Object}
     */
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
            // TODO : Need to add this to messages
            log( 'zoom called' );
            currentZoom = mapInstance.getZoom();
            mapInstance.setZoom( currentZoom + 1 );
            currentZoom++;
        });

        $( mapDom.mapMenu.zoomOut ).on( 'click', function() {
            // TODO : Need to add this to messages
            log( 'zoom out called' );
            currentZoom = mapInstance.getZoom();
            mapInstance.setZoom( currentZoom - 1 );
            currentZoom--;
        });

        $( mapDom.mapMenu.shortlist ).on( 'click', function() {
            showShortlist();
        });
    }

    /**
     * Fetch and show shortlisted items
     */
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
            maxZoom : 13,
            minimumClusterSize : 5,
            gridSize : 60
        } );
        defaultCluster= markerCluster;
        google.maps.event.addListener( markerCluster, 'clusteringend', function(){
            var currentClusters = defaultCluster.getClusters();
            checkClusterTooltip( currentClusters );
        });

        currentUserPosition = defaultCluster;
        geolocationHandler.detectLocation( generateDistanceCircle );
    }


    /**
     * returns active clusters. By default clusters also include clusters with values less than 5
     * this function filters them to return only those clusters which have markers greater than 5
     * @param  {Array} currentClusters array containing the current clusters
     * @return {Array}                 active clusters
     */
    function getActiveClusters( currentClusters ) {
        var activeClusters = [];
        for( var item in currentClusters ) {
            var cluster = currentClusters[ item ];
            if ( cluster.getSize() > 4 ) {
                activeClusters.push( cluster );
            }
        }
        return activeClusters;
    }


    /**
     * Check the current state of the clusters with the previous state
     * and see if the cluster tooltips needs to be redrawn.
     * @param  {Array} currentClusters Array containing the current clusters to check the tooltip for
     */
    function checkClusterTooltip( currentClusters ) {
        var activeClusters = getActiveClusters( currentClusters );
        var newCount = activeClusters.length;
        log( newCount + ':' + currentClusterCount );
        if ( newCount !== currentClusterCount ) {
            addInfoBoxToClusters( activeClusters );
            currentClusterCount = newCount;
        } else {
            log( 'cluster length has not changed' );
        }
    }


    /**
     * if the clusters view has changed, then remove all the current info bubbles.
     */
    function resetInfoBox() {
        for( var item in currentClusterInfobubbles ) {
            var infoBubble = currentClusterInfobubbles[ item ];
            infoBubble.close();
            infoBubble.onRemove();
        }
        currentClusterInfobubbles = [];
    }


    function getInfoBubbleSettings() {

        return {
            map: map,
            content: '<div class="phoneytext">Some label</div>',
            position: new google.maps.LatLng(-35, 151),
            shadowStyle: 0,
            padding: 0,
            backgroundColor: 'rgb(57,57,57)',
            borderRadius: 4,
            arrowSize: 10,
            borderWidth: 1,
            borderColor: '#2c2c2c',
            disableAutoPan: true,
            hideCloseButton: true,
            arrowPosition: 50,
            backgroundClassName: 'phoney',
            arrowStyle: 0
        };

    }


    /**
     * reset the view port and add new info boxes to the currently active clusters.
     */
    function addInfoBoxToClusters( currentClusters ) {
        resetInfoBox();
        for( var key in currentClusters ) {
            log( 'trying a new infoBubble ' + key );
            var settings = getInfoBubbleSettings();
            var infoBubble2 = new InfoBubble( settings );
            var cluster = ( function(){ return currentClusters[ key ]; } )();
            var location = ( function(){ return cluster.getCenter(); } )();
            var size = cluster.getSize();
            currentClusterInfobubbles.push( infoBubble2 );
            infoBubble2.position = location;
        }

        for( var item in currentClusterInfobubbles ){
            log( currentClusterInfobubbles[item].position );
            setTimeout( showInfoBubble( currentClusterInfobubbles[item] ) , 1000*item );
        }
    }


    function showInfoBubble( infoBubble ) {
            var toRun = function() {
                geolocationHandler.codePosition( infoBubble.position, function( address ) {
                    log( address );
                    log( infoBubble );
                    infoBubble.content = '<div class="phoneytext">' + address.split(',')[1] + '</div>';
                    infoBubble.open( mapInstance );
                });
            };
            return toRun;
    }



    /**
     * generate draggable circle for user.
     * @param  {HTML5 geolocation OBject } userLocation [description]
     */
    function generateDistanceCircle ( userLocation ) {

        var location = new google.maps.LatLng( userLocation.coords.latitude, userLocation.coords.longitude );
        var marker = new google.maps.Marker({
            map       : mapInstance,
            position  : location,
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


        currentCircle = new google.maps.Circle({
            map          : mapInstance,
            radius       : 3000,
            fillColor    : '#666666',
            fillOpacity  : 0.07,
            strokeColor  : '#ffb600',
            strokeWeight : 2,
            suppressUndo : true
        });

        google.maps.event.addListener(currentCircle, 'center_changed', function(){
            var updatedCenter = currentCircle.getCenter();
            updatePosition( updatedCenter );
        });

        google.maps.event.addListener(currentCircle, 'radius_changed', function(){
            var circleBounds = currentCircle.getBounds();
            map.fitBounds( circleBounds );
        });


        currentCircle.setEditable( true );
        currentCircle.bindTo( 'center', marker, 'position' );
    }


    function updateAddress( address ) {
        var address = address.split( ',' );
        address = 'near ' + address[1] + ', ' + address[2];
        address = address.substr( 0, 30 );
        $( mapDom.globalSearch.locationLabel ).text( address );
        $( mapDom.globalSearch.locationIconLoading ).hide();
        $( mapDom.globalSearch.locationIconMain ).show();
    }

    function updateLocation( address ) {
        $( mapDom.globalSearch.locationIconMain ).hide();
        $( mapDom.globalSearch.locationIconLoading ).show();
        geolocationHandler.codeAddress( address, setCircleCenter );
    }

    function updatePosition( location ) {
        $( mapDom.globalSearch.locationLabel ).html('');
        $( mapDom.globalSearch.locationIconMain ).hide();
        $( mapDom.globalSearch.locationIconLoading ).show();
        setCircleCenter( location );
        geolocationHandler.codePosition( location, updateAddress );
    }


    function setCircleCenter( newLocation ) {
        log( 'setCicleCenter called' );
        var currentLocation = currentCircle.getCenter();
        if ( currentLocation.lng() !== newLocation.lng() && currentLocation.lat() !== newLocation.lat() ) {
            currentCircle.setCenter( newLocation );
        }
        var circleBounds = currentCircle.getBounds();
        map.panTo( newLocation );
        map.fitBounds( circleBounds );
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


    function createLatLngObject( userLocation ) {
        var location = new google.maps.LatLng( userLocation.coords.latitude, userLocation.coords.longitude );
        updatePosition( location );
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
                path: fontawesome.markers.CIRCLE,
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
                var randomStatus = parseInt( ( Math.random() * 3 ), 10 );
                currentMarkerSettings.YStatus = randomStatus;

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
                var marker = new google.maps.Marker( currentMarkerSettings );
                var listener = google.maps.event.addListener(marker, 'click', showStoreInfo );
                markersToReturn.push( marker );
            }
            return markersToReturn;
        } else {
            log ( 'data not provided. Can not build markers' );
        }
    }

    function showLocationDropdown() {
    }


    function bindEvents() {
        $( mapDom.globalSearch.locationContainer ).on( 'click', function() {
            log( 'detected click' );
            $( this ).popover( 'toggle' );
        });

        $( mapDom.globalSearch.locationAuto ).on( 'click', function() {
            // DO SOMETHING
        });

        $( mapDom.globalSearch.container ).on( 'click',mapDom.globalSearch.locationUpdate , function() {
            var userAddress = $( mapDom.globalSearch.locationInput ).val();
            updateLocation( userAddress );
            $( mapDom.globalSearch.locationLabel ).html('');
            $( mapDom.globalSearch.locationContainer ).popover('toggle');
        });

        $( mapDom.globalSearch.container ).on( 'click',mapDom.globalSearch.locationAuto , function() {
            $( mapDom.globalSearch.locationContainer ).popover('toggle');
            $( mapDom.globalSearch.locationLabel ).html('');
            $( mapDom.globalSearch.locationIconMain ).hide();
            $( mapDom.globalSearch.locationIconLoading ).show();
            geolocationHandler.detectLocation( createLatLngObject );
        });

        var dropdownHtml = $( mapDom.globalSearch.locationDropdown ).html();
        $( mapDom.globalSearch.locationDropdown ).remove();
        $( mapDom.globalSearch.locationContainer ).popover({
            animation : true,
            html      : true,
            placement : 'bottom',
            trigger   : 'manual',
            content   : dropdownHtml
        });
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
                geolocationHandler = new locationModule();
                currentClusterCount = 0;
                initializeMapMenu();
                rawData = data;
                processData();
            } else {
                log( messages.noData );
            }
        } else {
            log( messages.noMap );
        }

        bindEvents();
    })();
};
