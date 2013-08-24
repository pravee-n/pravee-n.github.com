
/**
 * # FILL MAP MODULE
 *
 * @constructor
 *
 * Contains all the functions related to showing the pointer on the map,
 * handling infoBox shown on the map and all actions related to the map.
 *
 * @param {Google Map} map  current active map instance
 * @param {Object}     data data for the stores to be shown on the map
 */
var FillMap = function( map, data ) {

    // Declaring all the variables to be used by this module.
    var mapInstance,
        rawData,
        currentData,
        currentStores,
        currentMarkers,
        currentCircle,
        currentCircleBounds,
        currentActiveMarker,
        currentCluster,
        currentClusterCount,
        currentClusterInfobubbles,
        currentHoverBubble,
        infoBoxHandler,
        currentZoom,
        defaultCluster,
        anchorCorrection,
        circleCenterMarker;

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
        showStoreInfo    : 'show store info handler called',
        clustersRequested : 'Generate clusters called',
        generatingCircle : 'Generating the user location circle'
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
        },
        active : {
            color: '#27abe9'
        }
    };

    /**
     * settings object
     * For google map objects which require settings, if there are gonna be multiple objects with the same
     * settings, then create a function for it to return setting to prevent the context of the settings.
     * Only keep those settings here which would be used only once by a google maps object.
     */
    var settings = {
        markers: {
            circleCenter : {
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
                    rotation      : 180,
                    anchor        : anchorCorrection
                }
            },
            activeMarker : {
                animation : 'DROP',
                flat      : true,
                icon: {
                    path: fontawesome.markers.CIRCLE,
                    scale: 0.016,
                    strokeWeight: 4,
                    strokeColor: statusColors.active.color,
                    strokeOpacity: 1,
                    fillColor: statusColors.active.color,
                    fillOpacity: 0.55,
                    rotation: 0,
                    anchor: anchorCorrection
                }
            }
        },
        circle : {
            radius       : 3000,
            fillColor    : '#666666',
            fillOpacity  : 0.07,
            strokeColor  : '#ffb600',
            strokeWeight : 2,
            suppressUndo : true
        },
        activeInfoBubble: {
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
        },
        hoverBubble : {
            content             : '<div class="hover-bubble-inner"></div>',
            shadowStyle         : 0,
            padding             : 0,
            backgroundColor     : 'rgba(233,90,90,0.85)',
            borderRadius        : 4,
            arrowSize           : 10,
            borderWidth         : 0,
            borderColor         : '#e95a5a',
            disableAutoPan      : true,
            hideCloseButton     : true,
            arrowPosition       : 50,
            backgroundClassName : 'hover-bubble',
            arrowStyle          : 0,
            minWidth            : 20,
            minHeight           : 'none',
            maxWidth            : 400
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
            log( 'showing shortlisted products' );
            showShortlist();
        });
    }

    /**
     * Fetch and show shortlisted items
     */
    function showShortlist() {
        clearMarkers();
        var shorlistedMarkers = YShortlist.getList();
        for( var index in shorlistedMarkers ){
            var marker = shorlistedMarkers[ index ];
            log( marker.shortlistProductName );
            marker.setMap( mapInstance );
        }
    }

    /**
     * generate clusters from the current store data
     */
    function generateClusters () {
        log( messages.clustersRequested );
        var markers = buildMarkers( currentStores );
        var markerCluster = new MarkerClusterer( mapInstance, markers, {
            maxZoom : 13,
            minimumClusterSize : 5,
            gridSize : 60
        } );
        defaultCluster= markerCluster;
        currentUserPosition = defaultCluster;
    }

    /**
     * Print individual markers on the map from the array of current stores.
     * Checks the current store over the existing circle to get the bounds, and
     * shows only those markers which are contained in the bounds.
     * Either this or the generateClusters function is to be used to show the markers.
     */
    function printMarkers() {
        log( 'Markers reloading' );
        for( var item in currentMarkers ) {
            var marker = currentMarkers[ item ];
            if ( currentCircleBounds.contains( marker.position ) ) {
                marker.setMap( mapInstance );
            } else {
                marker.setMap( null );
            }
        }
    }

    /**
     * Clear currently loaded markers
     */
    function clearMarkers() {
        for( var item in currentMarkers ) {
            var marker = currentMarkers[ item ];
            marker.setMap( null );
        }
    }

    /**
     * returns active clusters. By default clusters also include clusters with values less than 5
     * this function filters them to return only those clusters which have markers greater than 5
     * ### NOT USED
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
     * ### NOT USED
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
     * ### NOT USED
     */
    function resetInfoBox() {
        for( var item in currentClusterInfobubbles ) {
            var infoBubble = currentClusterInfobubbles[ item ];
            infoBubble.close();
            infoBubble.onRemove();
        }
        currentClusterInfobubbles = [];
    }

    /**
     * Get the default settings of the infobubble for the cluster
     * ### NOT USED
     */
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
     * ### NOT USED
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

    /**
     * Print the infobubble on the map
     * ### NOT USED
     * @param  {Infobubble Object} infoBubble  infobbuble object to be shown.
     */
    function showInfoBubble( infoBubble ) {
        var toRun = function() {
            geolocationHandler.codePosition( infoBubble.position, function( address ) {
                infoBubble.content = '<div class="phoneytext">' + address.split(',')[1] + '</div>';
                infoBubble.open( mapInstance );
            });
        };
        return toRun;
    }

    /**
     * generate draggable circle for user.
     * @param  {HTML5 geolocation Object } userLocation [description]
     */
    function generateDistanceCircle ( userLocation ) {
        log( messages.generatingCircle );

        var location = new google.maps.LatLng( userLocation.coords.latitude, userLocation.coords.longitude );

        var circleMarker = settings.markers.circleCenter;
        circleMarker.map = mapInstance;
        circleMarker.position = location;

        circleCenterMarker = new google.maps.Marker( circleMarker );

        EYS.currentUserPosition = circleCenterMarker;

        var circleSettings = settings.circle;
        circleSettings.map = mapInstance;
        currentCircle = new google.maps.Circle( circleSettings );

        bindMapEvents();
    }

    /**
     * Event Handlers for various events binded to the map
     */
    function bindMapEvents() {
        currentCircle.bindTo( 'center', circleCenterMarker, 'position' );

        google.maps.event.addListener(circleCenterMarker, 'dragend', function(){
            var updatedCenter = currentCircle.getCenter();
            updatePosition( updatedCenter );
        });

        google.maps.event.addListener(currentCircle, 'radius_changed', function(){
            currentCircleBounds = currentCircle.getBounds();
            mapInstance.fitBounds( currentCircleBounds );
            printMarkers();
        });

        currentCircleBounds = currentCircle.getBounds();
        mapInstance.fitBounds( currentCircleBounds );
        currentCircle.setEditable( true );
        mapInstance.setCenter( currentCircle.center );
        updatePosition( currentCircle.getCenter() );

        // NEED TO REMOVE THIS
        updateLocation( 'indirapuram' );
    }

    /**
     * Updates the address in the header.
     * @param  {Google Address Object} address Google returned address object
     */
    function updateAddress( address ) {
        log( 'updateAddress called' );
        printMarkers();
        var address = address.split( ',' );
        address = 'near ' + address[1] + ', ' + address[2];
        address = address.substr( 0, 30 );
        $( mapDom.globalSearch.locationLabel ).text( address );
        $( mapDom.globalSearch.locationIconLoading ).hide();
        $( mapDom.globalSearch.locationIconMain ).show();
    }

    /**
     * updates the location on the map provided the given address.
     * @param  {String]} address Address entered by the user
     */
    function updateLocation( address ) {
        log( 'update Location called' );
        $( mapDom.globalSearch.locationLabel ).html( address );
        $( mapDom.globalSearch.locationIconMain ).hide();
        $( mapDom.globalSearch.locationIconLoading ).show();
        geolocationHandler.codeAddress( address, setCircleCenter );
    }

    /**
     * called when the position of the circle is updated and we get a new location.
     * Calls update position after looking up for address of the given location
     * @param  {LatLng Object} location Google lat lng Object
     */
    function updatePosition( location ) {
        log( 'updatePosition called' );
        $( mapDom.globalSearch.locationLabel ).html('');
        $( mapDom.globalSearch.locationIconMain ).hide();
        $( mapDom.globalSearch.locationIconLoading ).show();
        setCircleCenter( location );
        geolocationHandler.codePosition( location, updateAddress );
    }

    /**
     * Set's the center of the circle to a new position
     * @param {Google LatLng Object} newLocation latLng Object
     */
    function setCircleCenter( newLocation ) {
        log( 'setCicleCenter called' );
        var currentLocation = currentCircle.getCenter();
        if ( currentLocation.lng() !== newLocation.lng() && currentLocation.lat() !== newLocation.lat() ) {
            currentCircle.setCenter( newLocation );
        }
        var circleBounds = currentCircle.getBounds();
        map.panTo( newLocation );
        map.fitBounds( circleBounds );
        currentCircleBounds = currentCircle.getBounds();
        $( mapDom.globalSearch.locationIconLoading ).hide();
        $( mapDom.globalSearch.locationIconMain ).show();
        printMarkers();
    }

    /**
     * process raw data
     */
    function processData() {
        if ( rawData ) {
            currentStores = rawData;
            buildMarkers( currentStores );
            geolocationHandler.detectLocation( generateDistanceCircle );
        }
    }

    /**
     * shows store info on the info container and pans the map to accomodate the info box
     * @param  {Object} event Google maps click event
     */
    function showStoreInfo( event ) {
        log( 'showing information for selected store' );
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

        // Reset the previous marker to its default state
        if ( currentActiveMarker && currentActiveMarker.YDefaultColor ) {
            currentActiveMarker.icon.strokeColor = currentActiveMarker.YDefaultColor;
            currentActiveMarker.icon.fillColor = currentActiveMarker.YDefaultColor;
            currentActiveMarker.icon.scale = 0.012;
            currentActiveMarker.icon.stroke = 1;
            currentActiveMarker.setIcon( currentActiveMarker.icon );
        }

        // Change the state of the currently selected marker
        currentActiveMarker = pointer;
        currentActiveMarker.YDefaultColor = pointer.icon.strokeColor;
        currentActiveMarker.icon.strokeColor = statusColors.active.color;
        currentActiveMarker.icon.fillColor = statusColors.active.color;
        currentActiveMarker.icon.scale = 0.014;
        currentActiveMarker.icon.stroke = 4;
        currentActiveMarker.setIcon( currentActiveMarker.icon );

        infoBoxHandler.update( pointer, userPosition );

        // mapInstance.panTo( newMapPosition );
    }

    /**
     * Create a google latLng object from a HTML5 geolocation object.
     * @param  {Object} userLocation HTML5 geolocation object
     */
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
                scale: 0.009,
                strokeWeight: 10,
                strokeColor: '#ffc000',
                strokeOpacity: 0.5,
                fillColor: '#fbff9a',
                fillOpacity: 1,
                rotation: 0,
                anchor: anchorCorrection
            }
        };
    };

    /**
     * Shows the hover bubble according to the current marker.
     * Also initializes the bubble if its not initialized yet.
     */
    function showHoverBubble() {

        var pointer = this;
        var bubbleSettings = settings.hoverBubble;

        if( !currentHoverBubble ){
            log( 'initializing the hover bubble' );
            currentHoverBubble = new InfoBubble( settings.hoverBubble );
        }

        if( pointer ) {
            currentHoverBubble.setContent( getHoverBubbleContent( pointer ) );
            currentHoverBubble.setBackgroundColor( pointer.icon.fillColor );
            currentHoverBubble.open( mapInstance, pointer );
        } else {
            log( 'can not show hover bubble. Pointer not obtained' );
        }
    }

    /**
     * Hide the hover bubble
     */
    function hideHoverBubble() {
        if( currentHoverBubble ) {
            currentHoverBubble.close();
        } else {
            log( 'current hover bubble not defined' );
        }
    }

    /**
     * Returns the inner HTML of the hover bubble
     * @param  {Google Maps Pointer} pointer pointer on which we need to show the tooltip
     * @return {String}              formatted HTML
     */
    function getHoverBubbleContent( pointer ) {
        var message = pointer.YMessage;
        var price = pointer.YPrice;
        return '<div class="hover-bubble-inner">' +
                    '<div class="hover-bubble-status">' + message + '</div>' +
                    '<div class="hover-bubble-price"><i class="icon-inr"></i>' + price + '</div>'+
                '</div>';
    }

    /**
     * build a markers array.
     * @param  Object data  Data containing markers' data
     * @return Object       Array containing objects as markers
     */
    function buildMarkers( data ) {
        var log = bows( 'buildMarkers' );
        var markersToReturn = [];
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
                currentMarkerSettings.YPrice   = parseInt( ( Math.random() * 10000 ), 10 );
                var randomStatus = parseInt( ( Math.random() * 3 ), 10 );
                currentMarkerSettings.YStatus = randomStatus;
                currentMarkerSettings.isShortlist = false;

                if ( randomStatus === 0 ) {
                    currentMarkerSettings.icon.strokeColor = statusColors.available.color;
                    currentMarkerSettings.icon.fillColor = statusColors.available.color;
                    currentMarkerSettings.YMessage = 'Available';

                } else if ( randomStatus === 1 ) {
                    currentMarkerSettings.icon.fillColor = statusColors.notAvailable.color;
                    currentMarkerSettings.icon.strokeColor = statusColors.notAvailable.color;
                    currentMarkerSettings.YMessage = 'Not Available';
                } else if ( randomStatus === 2 ) {
                    currentMarkerSettings.icon.fillColor = statusColors.noInfo.color;
                    currentMarkerSettings.icon.strokeColor = statusColors.noInfo.color;
                    currentMarkerSettings.YMessage = 'Ending Soon';
                } else {
                    currentMarkerSettings.icon.fillColor = statusColors.noInfo.color;
                    currentMarkerSettings.icon.strokeColor = statusColors.noInfo.color;
                    currentMarkerSettings.YMessage = 'No Information';
                }
                var marker = new google.maps.Marker( currentMarkerSettings );
                var listener = google.maps.event.addListener( marker, 'click', showStoreInfo );

                var listener = google.maps.event.addListener( marker, 'mouseover', showHoverBubble );
                var listener = google.maps.event.addListener( marker, 'mouseout', hideHoverBubble );

                markersToReturn.push( marker );
            }
            currentMarkers = markersToReturn;
            return markersToReturn;
        } else {
            log ( 'data not provided. Can not build markers' );
        }
    }

    /**
     * Bind various DOM events
     */
    function bindDomEvents() {

        // Event Binder for Popover to close when clicked outside.
        $( 'body' ).on( 'click', function() {
            $( mapDom.globalSearch.locationContainer ).popover( 'hide' );
        });

        // Toggle the location container popover.
        $( mapDom.globalSearch.locationContainer ).on( 'click', function( e ) {
            $( this ).popover( 'toggle' );
            e.stopPropagation();
        });

        // Location update button
        $( mapDom.globalSearch.container ).on( 'click',mapDom.globalSearch.locationUpdate , function() {
            var userAddress = $( mapDom.globalSearch.locationInput ).val();
            updateLocation( userAddress );
            $( mapDom.globalSearch.locationContainer ).popover('toggle');
        });

        // Location Auto update button
        $( mapDom.globalSearch.container ).on( 'click',mapDom.globalSearch.locationAuto , function() {
            $( mapDom.globalSearch.locationContainer ).popover('toggle');
            $( mapDom.globalSearch.locationLabel ).html('');
            $( mapDom.globalSearch.locationIconMain ).hide();
            $( mapDom.globalSearch.locationIconLoading ).show();
            geolocationHandler.detectLocation( createLatLngObject );
        });

        // Prevent closing of popover when clicked inside the popover
        $( mapDom.globalSearch.container ).on( 'click', '.popover' , function( e ) {
            e.stopPropagation();
        });

        // Initialize the location input popover that comes in the search bar.
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
                anchorCorrection = new google.maps.Point( -200, 100 );
                processData();
            } else {
                log( messages.noData );
            }
        } else {
            log( messages.noMap );
        }

        bindDomEvents();
    })();
};
