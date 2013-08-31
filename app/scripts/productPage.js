var google = google || {};

/**
 * SINGLETON
 *
 * Responsible for handling the product page
 */
var productController = ( function(){

    var fillMapController,
        mapInstance,
        currentData,
        productHandler;

    var log = bows( 'productController' );

    var messages = {
        mapLoad : 'Map Loaded'
    };

    // DEFINING THE SETTINGS VARIABLE
    var settings = {
        mapStyle : [{
            featureType: 'all',
            elementType: 'all',
            stylers: [ { visibility: 'on' }, { saturation: -70 }, { gamma: 1.20 } ]
        }],
        mapCenterAddress : 'India Gate, New Delhi',
        mapContainer     : 'product-map-canvas',
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
            getData();
        });
        log( messages.mapLoad );
    }

    /**
     * initialize fillMap module to handle all the map related stuff.
     * @param  {Object} data data of pointers to be shown.
     */
    function renderMap( data ) {
        fillMapController = new FillMap( mapInstance, data );
    }

    /**
     * Get the filers for the current search
     */
    function getFilters() {
        var filterHandler = new YFilter( settings.filterDataUrl );
        $( 'body' ).bind( 'YFilterReady', function() {
            var html = filterHandler.getHtml();
            $( '.search-filter-item-sc' ).prepend( html );
            $( '.search-filter-item-sc' ).slideDown( 'fast' );
            filterHandler.activate();
        });
    }

    /**
     * Toggle the sliding product details section.
     */
    function toggleProductDetails() {
        $( '.js-product-details-container' ).toggle();
        $( '.js-product-overlay' ).toggle();
    }

    /**
     * Get stores for the currently active store
     */
    function getData() {
        mainData.getProductObject( 1, initializeProductHandler );
    }

    /**
     * Initialize the store handler that takes care of the products in the sidebar.
     * @param  {Object} data data containing all stores
     */
    function initializeProductHandler( data ) {
        productHandler = new YStores();
        var renderData = {};
        renderData.stores = data.stores;
        renderMap( renderData.stores );
        productHandler.getHtml( renderData, renderProducts );
    }

    /**
     * render products in the sidebar and attach events.
     * @param  {String} html html received
     */
    function renderProducts( html ) {
        $( '.section-status1' ).html( html );
        $( '.section-status2' ).html( html );
        $( '.section-status3' ).html( html );
        $( '.section-status4' ).html( html );
        bindEvents();
        getFilters();
    }

    /**
     * Bind various DOM events
     */
    function bindEvents() {
        $( '.search-product-inner, .product-details-inner' ).slimScroll({
            height: '100%'
        });

        $( '.product-store-section' ).slimScroll( {
            height: '54%'
        });

        $( '.js-product-more-details-button' ).on( 'click', function() {
            toggleProductDetails();
        });

        $( '.js-product-details-close, .js-product-overlay' ).on( 'click', function() {
            toggleProductDetails();
        });

        $( '.product-store-menu-item' ).on( 'click', function() {
            $( '.selected' ).removeClass( "selected" );
            $( this ).addClass( 'selected' );
        });
    }

    /**
     * initialize the search view Controller
     */
    function init() {
        initializeMap();
    }

    return {
        init : init
    };
})();


$( document ).ready( function() {
    analytics.pageview();
    $( '.js-product-image-slider' ).unslider({
        dots: true,
        fluid : true,
        arrows: true
    });
    google.maps.event.addDomListener( window, 'load', productController.init );
});
