var EYS = {};


var YShortlist = (function() {

    var shortlistedItems;
    shortlistedItems = [];

    var dom = {
        shortlistValue : '.js-shortlist-value'
    };

    function add( pointer ) {
        shortlistedItems.push( pointer );
        pointer.isShortlist = true;
    }

    function getList(){
        return shortlistedItems;
    }

    return {
        add     : add,
        getList : getList
    };

})();


var infoContainerHandler = function( map ) {

    var mapInstance, currentPointer, currentUserPosition, isCompiled, compiledTemplate, directionsDisplay, isInserted, currentStoreInfoObject;

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

    var messages = {
        noMap : 'Map instance not provided',
        noUpdate : 'Update called but insufficient arguments. Abort'
    };

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


    function renderDirections(){
        $( dom.storeExpand ).click();
        clearCurrentDirections();
        directionsDisplay.setMap( mapInstance );
        directionsDisplay.setDirections( currentStoreInfoObject.directionResponse );
        // google.maps.event.addListenerOnce(mapInstance, 'idle', function(){
        //     var pointer = currentPointer;

        //     var bounds = mapInstance.getBounds();
        //     var ne = bounds.getNorthEast();
        //     var sw = bounds.getSouthWest();

        //     var userPosition = EYS.currentUserPosition.getPosition();
        //     var pointerPosition = pointer.getPosition();
        //     var userLeft = pointerPosition.lng();
        //     var userTop = pointerPosition.lat();
        //     var mapDistance = Math.abs( sw.lng() - ne.lng() );
        //     var newPan = userLeft + 0.2 * mapDistance ;
        //     log( newPan );
        //     var newMapPosition = new google.maps.LatLng( userTop ,newPan );

        //     mapInstance.panTo( newMapPosition );
        // });
    }


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


$(document).ready(function(){
  $( 'input' ).iCheck({
        checkboxClass: 'icheckbox_flat-red',
        radioClass: 'iradio_flat-red'
    });
});
