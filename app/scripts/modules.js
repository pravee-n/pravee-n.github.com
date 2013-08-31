var EYS = (function() {
    var currentLocation,
        currentActiveProduct,
        currentActiceStore;

    var log = bows( 'EYS' );

    function setCurrentLocation( lattitude, longitude ) {
    }

    function getCurrentLocation(){
    }

    function setActiveProduct( id ){
        if( id ) {
            log( 'acive product changed to #' + id );
            currentActiveProduct = id;
            $( 'body' ).trigger( {
                type :'setActiveProduct',
                id   : id
            });
        } else {
            log( 'requested to set active product but no id provided' );
        }
    }

    function getActiveProduct(){
        if( currentActiveProduct ) {
            return currentActiveProduct;
        } else {
            log( "current product not set " );
            return false;
        }
    }

    function setActiveStore(){
    }

    function getActiveStore(){
    }

    return {
        setCurrentLocation : setCurrentLocation,
        getCurrentLocation : getCurrentLocation,
        setActiveProduct   : setActiveProduct,
        getActiveProduct   : getActiveProduct,
        setActiveStore     : setActiveStore,
        getActiveStore     : setActiveStore
    };
})();


/**
 * @Singleton
 *
 * Modules responsible for handling the logic of shortlist.
 * Provides basic add, remove and fetch list functionality.
 */
var YShortlist = (function() {

    var shortlistedItems, currentPointer;
    var count = 0;
    var shortlistedItems = [];

    var log = bows( 'YShortlist' );

    /**
     * Storing all dom access selectors here
     * @type Object
     */
    var dom = {
        shortlistValue : '.js-shortlist-value',
        shortlistContainer : '.js-product-list-shortlisted'
    };

    /**
     * Add a pointer to the shortlist
     * @param {Google maps pointer} pointer Google maps pointer object
     */
    function add( pointer ) {
        log( 'addding item to the shortlist' );
        pointer.isShortlist = true;

        pointer.shortlistProductId = EYS.getActiveProduct();
        currentPointer = pointer;
        count++;
        $( dom.shortlistValue ).text( count );
        if ( pointer.shortlistProductId ) {
            mainData.getProductObject( pointer.shortlistProductId, savePointer );
        } else {
            savePointer();
        }
    }

    function savePointer( productObject ) {
        if ( productObject ) {
            currentPointer.shortlistProductName = productObject.name;
        }

        shortlistedItems.push( currentPointer );
    }

    /**
     * Remove a pointer from the shortlisted items
     * @param  {Google Maps Pointer} pointer Google maps pointer to be removed
     */
    function remove( pointer ) {
        log( 'Requested to remove item from shortlist' );
        var id = pointer.YId;
        for( var index in shortlistedItems ) {
            var pointer = shortlistedItems[ index ];
            if ( pointer.YId === id ) {
                shortlistedItems.splice( index, 1 );
                pointer.isShortlist = false;
                count--;
                $( dom.shortlistValue ).text( count );
                log( 'Item found and removed from shortlisted items' );
                break;
            }
        }
    }

    /**
     * Get the list of shortlisted items
     * @return {Array} Array of pointers in the shortlist
     */
    function getList(){
        log( 'requested list of shortlisted items' );
        return shortlistedItems;
    }

    return {
        add     : add,
        getList : getList,
        remove  : remove
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
                name        : pointer.YName,
                address     : pointer.YAddress,
                phone       : pointer.YPhone,
                image       : pointer.YPicture,
                price       : pointer.YPrice,
                isShortlist : pointer.isShortlist
            };
            getDirections();
        } else {
            log( messages.noUpdate );
        }
    }


    /**
     * PUBLIC
     *
     * Hide the info window
     *
     * @return {[type]} [description]
     */
    function deactivate(){
        $( dom.mainContainer ).slideUp( 'fast' );
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
                suppressMarkers     : true,
                suppressInfoWindows : true,
                preserveViewport    : false
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
            type : "GET",
            url : settings.template,
            success : function( template ) {
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
            if( !$( this ).hasClass( 'selected') ) {
                YShortlist.add( currentPointer );
                $( this ).addClass( 'selected' );
                $( dom.shortlistActionIcon ).removeClass( 'icon-bookmark-empty' ).addClass( 'icon-bookmark' );
            } else {
                YShortlist.remove( currentPointer );
                $( this ).removeClass( 'selected' );
                $( dom.shortlistActionIcon ).addClass( 'icon-bookmark-empty' ).removeClass( 'icon-bookmark' );
            }
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
        var html = compiledTemplate( currentStoreInfoObject );
        $( dom.mainContainer ).html( html );
        $( dom.mainContainer ).slideDown( 'fast' );
        eventBinders();
    }

    return {
        update     : update,
        deactivate : deactivate
    };
};
/**
 * ---------- END OF INFO CONTAINER MODULE ---------------
 */

/**
 * Code address, code location and other location helper functions.
 */
var locationModule = function() {
    var geocoder, currentLocation;

    var log = bows( 'locationModule' );

    /**
     * Contains all logging messages to be used by this module.
     * @type {Object}
     */

    var messages = {
        codeAddress           : 'Request received for coding address',
        codePosition          : 'Request received for coding co-ordinates',
        noAddress             : 'No address provided',
        noCallback            : 'No callback provided',
        currentLocation       : 'Request received for current location',
        noCurrentLocation     : 'HTML5 geolocation is not available',
        updateCurrentLocation : 'Requested to update current location',
        geocodeNotAvailable   : 'Google geocode service is not available'
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
    function codePosition( position, callback, argument ) {
        log( messages.codePosition + position );
        var address;
        if ( geocoder ) {
            if( position ) {
                geocoder.geocode( {'latLng' : position}, function( results, status ) {
                    if ( status === google.maps.GeocoderStatus.OK ) {
                        address = results[0].formatted_address;
                        if ( callback ) {
                            callback( address, argument );
                        } else {
                            log( messages.noCallback );
                        }
                    } else {
                        log( messages.geocodeNotAvailable + ' ' + status );
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
/**
 * ---------- END OF INFO LOCATION MODULE ---------------
 */


/**
 * Notification module.
 * Binds to the even YNotify and shows notifcation in js-y-notifcation box.
 */
var YNotification = (function(){

    var queuedMessage,
        currentState;

    var log = bows( 'YNotify' );

    var dom = {
        errorClass   : '.js-y-notification-error',
        successClass : '.js-y-notification-success',
        workingClass : '.js-y-notification-working',
        container    : '.js-y-notification',
        icon         : '.js-y-notification-icon',
        text         : '.js-y-notification-text'
    };

    var messages = {
        noEventData : 'Event fired but no data provided. ABORTING',
        requested   : 'Requested notification',
        noMsg       : 'Status set to true, but no message provided',
        showMsg     : 'Showing message',
        queuedMsg   : 'Already showing message. Queued the current message',
        msgEnd      : 'Message came to an end',
        hideMsg     : 'No more messages'
    };

    function showNotification( msg, notQueue ) {

        if( !notQueue ) {
            queuedMessage.push( msg );
        }
        log( queuedMessage );
        log( currentState );
        if( !currentState ) {
            log( msg );
            $( dom.text ).text( msg );
            $( dom.container ).show();
            currentState = 1;
        } else {
            log( messages.queuedMsg );
        }
    }


    function hideNotification( msg ) {
        log( messages.msgEnd + msg );
        for( var item in queuedMessage ) {
            var checkMsg = queuedMessage[ item ];
            if( msg === checkMsg ) {
                queuedMessage.splice( item, 1 );
                break;
            }
        }
        if( checkQueue() ) {
            currentState = 0;
            log( messages.hideMsg );
            $( dom.text ).text( '' );
            $( dom.container ).hide();
        }
    }

    function checkQueue(){
        log( 'check QUEUE : ' + queuedMessage );
        var flag = 0;
        for( var item in queuedMessage ){
            var msg = queuedMessage[ item ];
            showNotification( msg, true );
            flag = 1;
        }
        return flag;
    }


    (function init(){
        queuedMessage = [];
        currentState = 0;
        $( 'body' ).on( 'YNotify', function( event ) {
            preCheck( event );
        });
    })();

    return {
        show : showNotification,
        end    : hideNotification
    };
})();
/**
 * ---------- END OF NOTIFICATION MODULE ---------------
 */


$(document).ready(function(){
  $( 'input' ).iCheck({
        checkboxClass: 'icheckbox_flat-red',
        radioClass: 'iradio_flat-red'
    });
});
