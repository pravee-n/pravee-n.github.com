var EYS = {};



/**
 * Modules responsible for handling the logic of shortlist. Provides basic add, remove and fetch list functionality.
 * @return {[type]} [description]
 */
var YShortlist = (function() {

    var shortlistedItems;
    shortlistedItems = [];

    /**
     * Storing all dom access selectors here
     * @type Object
     */
    var dom = {
        shortlistValue : '.js-shortlist-value'
    };


    /**
     * Add a pointer to the shortlist
     * @param {Google maps pointer} pointer Google maps pointer object
     */
    function add( pointer ) {
        shortlistedItems.push( pointer );
        pointer.isShortlist = true;
    }

    /**
     * Get the list of shortlisted items
     * @return {Array} Array of pointers in the shortlist
     */
    function getList(){
        return shortlistedItems;
    }

    return {
        add     : add,
        getList : getList
    };
})();

/**
 * ---------- END OF SHORTLIST MODULE ---------------
 */


/**
 * Module responsible for handling all the actions related to the info
 * box that appears on the map
 *
 * @param  {Google Maps object} map Instance of the map to attach the info box to.
 */
var infoContainerHandler = function( map ) {

    var mapInstance, currentPointer, currentUserPosition, isCompiled, compiledTemplate, directionsDisplay, isInserted, currentStoreInfoObject;

    /**
     * Contains all DOM references to be used by this module.
     * @type {Object}
     */
    var dom = {
        mainContainer       : '.js-store-info-main',
        title               : '.js-store-title',
        status              : '.js-store-info-status',
        price               : '.js-store-price-container',
        priceValue          : '.js-store-price-value',
        shortlistAction     : '.js-store-shortlist-action',
        shortlistActionIcon : '.js-shortlist-action-icon',
        rating              : '.js-store-rating',
        distance            : '.js-store-distance-container',
        distanceValue       : '.js-store-distance-value',
        storeExpand         : '.js-store-info-expand',
        expandContainer     : '.js-store-expand-container',
        expandImage         : '.js-store-expand-image',
        expandName          : '.js-store-expand-name',
        expandAddress       : '.js-store-expand-address',
        expandPhone         : '.js-store-expand-phone-value',
        expandOtherInfo     : '.js-store-expand-other-container',
        expandDirectionBtn  : '.js-store-expand-direction-button',
        closeInfoBox        : '.js-search-info-close'
    };

    /**
     * Contains all the logging messages for this module
     * @type {Object}
     */
    var messages = {
        noMap : 'Map instance not provided',
        noUpdate : 'Update called but insufficient arguments. Abort'
    };

    /**
     * Contains all the settings for this module
     * @type {Object}
     */
    var settings = {
        template : 'scripts/templates/storeInfo.template'
    };

    var log = bows( 'infoContainerHandler' );


    /**
     * update info box with current store marker details
     * @param  {Google Maps Marker} pointer      store marker pointer
     * @param  {HTML5 geolocation } userPosition current user position
     */
    function update( pointer, userPosition ) {

        if ( pointer && userPosition ) {
            currentPointer = pointer;
            currentUserPosition = userPosition;
            currentStoreInfoObject = {
                name    : pointer.YName,
                address : pointer.YAddress,
                phone   : pointer.YPhone,
                image   : pointer.YPicture,
                price   : pointer.YPrice
            };
            getDirections();
        } else {
            log( messages.noUpdate );
        }
    }


    /**
     * Initialization function. Called automatically whenever an object of this module
     * has been created. Handles all the initialization tasks to be done.
     * @return {[type]} [description]
     */
    (function init() {
        if ( map ) {
            mapInstance = map;
            preLoadTemplate();
            directionsDisplay = new google.maps.DirectionsRenderer({
                suppressMarkers  : true,
                suppressInfoWindows : true,
                preserveViewport : false
            });

        } else {
            log( messages.noMap );
        }
    })();


    /**
     * preload and compile the info box template
     */
    function preLoadTemplate() {
        $.ajax({
            type     : "GET",
            url      : settings.template,
            success  : function( template ) {
                compiledTemplate = Handlebars.compile( template );
                isCompiled = true;
            }
        });
    }


    /**
     * bind various events pertaining to the info box
     */
    function eventBinders() {
        $( dom.shortlistAction ).on( 'click', function() {
            YShortlist.add( currentPointer );
            $( this ).addClass( 'selected' );
            $( dom.shortlistActionIcon ).removeClass( 'icon-bookmark-empty' ).addClass( 'icon-bookmark' );
        });

        $( dom.storeExpand ).on( 'click', function() {
            $( dom.expandContainer ).slideToggle( 'fast' );
        });

        $( dom.expandDirectionBtn ).on( 'click', function(){
            renderDirections();
        });

        $( dom.closeInfoBox ).on( 'click', function(){
            $( dom.mainContainer ).slideUp( 'fast' );
        });
    }


    /**
     * get directions between two points
     */
    function getDirections() {

        var destination = currentPointer.getPosition();
        var source = currentUserPosition;

        var directionsObject = {
            destination : destination,
            origin      : source,
            travelMode  : google.maps.DirectionsTravelMode.DRIVING
        };

        var directionService = new google.maps.DirectionsService();
        directionService.route( directionsObject, directionHandler );
    }


    /**
     * Simply clear the currently visible directions.
     */
    function clearCurrentDirections() {
        directionsDisplay.setMap();
    }

    /**
     * render Directions on the map
     * @param  {Object} data   [description]
     * @param  {String} status [description]
     */
    function directionHandler( data, status ) {
        var distance = data.routes[0].legs[0].distance.text;
        currentStoreInfoObject.distance = distance;
        currentStoreInfoObject.directionResponse = data;
        renderTemplate();
    }


    /**
     * Show directions on the map
     */
    function renderDirections(){
        $( dom.storeExpand ).click();
        clearCurrentDirections();
        directionsDisplay.setMap( mapInstance );
        directionsDisplay.setDirections( currentStoreInfoObject.directionResponse );
    }


    /**
     * Finally inserts the info box and shows it with the animation.
     */
    function renderTemplate() {
        log( currentStoreInfoObject );
        var html = compiledTemplate( currentStoreInfoObject );
        $( dom.mainContainer ).html( html );
        $( dom.mainContainer ).slideDown( 'fast' );
        eventBinders();
    }

    return {
        update : update
    };
};

/**
 * ---------- END OF INFO CONTAINER MODULE ---------------
 */



var locationModule = function() {
    var geocoder, currentLocation;

    var log = bows( 'locationModule' );

    /**
     * Contains all DOM references to be used by this module.
     * @type {Object}
     */

    var messages = {
        codeAddress : 'Request received for coding address',
        codePosition : 'Request received for coding co-ordinates',
        noAddress: 'No address provided',
        noCallback : 'No callback provided',
        currentLocation : 'Request received for current location',
        noCurrentLocation : 'HTML5 geolocation is not available',
        updateCurrentLocation : 'Requested to update current location',
        geocodeNotAvailable : 'Google geocode service is not available'
    };

    /**
     * Get the latitude and longitude of the address provided
     * @param  {String}   address  Address to lookup google for.
     * @param  {Function} callback Function to callback when the request completes
     */
    function codeAddress( address, callback ) {
        log( messages.codeAddress );
        var position;
        if ( geocoder ) {
            if( address ) {
                geocoder.geocode( {'address' : address}, function( results, status ) {
                    log( status );
                    if ( status === google.maps.GeocoderStatus.OK ) {
                        position = results[0].geometry.location;
                        if ( callback ) {
                            callback( position );
                        } else {
                            log( messages.noCallback );
                        }
                    } else {
                        log( messages.geocodeNotAvailable );
                    }
                });
            } else {
                log( messages.noAddress );
            }
        }
    }

    /**
     * Get the address of the current co-ordinates on the map.
     * @param  {Google LatLng Object}   position Google latLng object.
     * @param  {Function}               callback Function to callback when the request completes
     */
    function codePosition( position, callback ) {
        log( messages.codePosition );
        var address;
        if ( geocoder ) {
            if( position ) {
                geocoder.geocode( {'latLng' : position}, function( results, status ) {
                    if ( status === google.maps.GeocoderStatus.OK ) {
                        address = results[0].formatted_address;
                        if ( callback ) {
                            callback( address );
                        } else {
                            log( messages.noCallback );
                        }
                    } else {
                        log( messages.geocodeNotAvailable );
                    }
                });
            } else {
                log( messages.noAddress );
            }
        }
    }

    /**
     * Get the current location of the user
     * @param  {Function} callback Function to callback when the request completes
     */
    function getCurrentLocation( callback ){
    }


    function detectLocation( callback ) {
        if ( Modernizr.geolocation ) {
            navigator.geolocation.getCurrentPosition( callback );
        } else {
            callback( false );
        }
    }


    /**
     * update the current location of the user
     * @param  {Function} callback Function to callback when the request completes
     */
    function updateCurrentLocation( position, callback ) {
    }

    (function init(){
        geocoder = new google.maps.Geocoder();
    })();

    return {
        codeAddress        : codeAddress,
        codePosition       : codePosition,
        getCurrentLocation : getCurrentLocation,
        currentLocation    : currentLocation,
        detectLocation     : detectLocation
    };

};


$(document).ready(function(){
  $( 'input' ).iCheck({
        checkboxClass: 'icheckbox_flat-red',
        radioClass: 'iradio_flat-red'
    });
});
