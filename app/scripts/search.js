var google = google || {};

/**
 * Main controller responsible for handling all the actions related
 * to the SEARCH VIEW
 */
var searchController = ( function(){

    var fillMapController, mapInstance, currentData, productHandler;

    var log = bows( 'searchContoller' );

    /**
     * Contains all DOM references to be used by this module.
     * @type {Object}
     */
    var messages = {
        mapLoad : 'Map Loaded'
    };

    /**
     * Contains all the settings for this module
     * @type {Object}
     */
    var settings = {
        mapStyle : [{
            featureType: 'all',
            elementType: 'all',
            stylers: [ { visibility: 'on' }, { saturation: -70 }, { gamma: 1.20 } ]
        }],
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
            zoom             : 17,
            mapTypeId        : google.maps.MapTypeId.ROADMAP,
            styles           : settings.mapStyle,
            disableDefaultUI : true,
            scrollwheel      : true
        };
        google.maps.visualRefresh = true;
        mapInstance = new google.maps.Map( document.getElementById( settings.mapContainer ),mapOptions );

        var geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': settings.mapCenterAddress }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK ) {
                mapInstance.setCenter( results[0].geometry.location );
                mapInstance.fitBounds( results[0].geometry.viewport );
            }
        });
        log( messages.mapLoad );
        getData();
    }


    /**
     * Render various elements on the map
     * @param  {Object} data Data containing the pointers
     */
    function renderMap( data ) {
        log( data );
        fillMapController = new FillMap( mapInstance, data );
    }

    /**
     * Get all the data required by this module. Preloading data for a better experience
     * for the user.
     */
    function getData() {
        mainData.getStores( renderMap );
        mainData.getProducts( initializeProductHandler );
    }

    /**
     * Get the filers for the current search
     */
    function getFilters() {
        var filterHandler = new YFilter( settings.filterDataUrl );
        $( 'body' ).bind( 'YFilterReady', function() {
            var html = filterHandler.getHtml();

            $( '.search-filter-item-sc' ).prepend( html );

            $( 'input' ).iCheck({
                checkboxClass: 'icheckbox_flat-red',
                radioClass: 'iradio_flat-red'
            });

            $( '.search-filter-item-sc' ).slideDown( 'slow' );

            $( '.more-filter-item-list' ).on( "click", function() {
                var html = $( this ).find( '.more-filter-item-options' ).html();
                $( '.more-filter-option-container-inner' ).html( html );
            });

            $( '.filter-item' ).on( 'mouseenter', function() {
                $( '.filter-item' ).not(this).removeClass( 'selected' ).find( '.filter-item-list' ).slideUp( 'fast' );
                $( this ).addClass( 'selected' );
                $( this ).find( '.filter-item-list' ).slideDown( 'fast' );
            });

            $( '.filter-item' ).on( 'mouseleave', function() {
                $( '.filter-item' ).not(this).removeClass( 'selected' ).find( '.filter-item-list' ).slideUp( 'fast' );
                $( this ).removeClass( 'selected' );
                $( this ).find( '.filter-item-list' ).slideUp( 'fast' );
            });

            $( '.filter-item-list' ).on( 'click', function( event ) {
                log( 'detected click' );
                event.stopPropagation();
            });

            $( '.search-product-inner' ).slimScroll({
                height: '100%'
            });

        });
    }

    /**
     * Initialize the product handler module. This would be responsible for rendering the
     * product list on the left.
     * @param  {Object} data Contains the list of products
     */
    function initializeProductHandler( data ) {
        productHandler = new YProducts();
        var renderData = {};
        renderData.products = data;
        productHandler.getHtml( renderData, renderProducts );
    }

    /**
     * Render the product list.
     * @param  {String} html contains the html of all the product item blocks.
     */
    function renderProducts( html ) {
        $( '.search-product-inner' ).html( html );
        productHandler.activate();
    }

    /**
     * initialize the search view Controller
     */
    function init() {
        initializeMap();
        getFilters();
    }

    return {
        init : init
    };

})();


$( document ).ready( function() {
    google.maps.event.addDomListener( window, 'load', searchController.init );
});
