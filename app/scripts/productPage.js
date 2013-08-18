var google = google || {};

var productController = ( function(){

    var fillMapController, mapInstance, currentData, productHandler;

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

    function renderMap( data ) {
        log( data );
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

    function getData() {
        mainData.getProductObject( 1, initializeProductHandler );
    }


    function initializeProductHandler( data ) {
        productHandler = new YStores();
        var renderData = {};
        renderData.stores = data.stores;
        renderMap( renderData.stores );
        productHandler.getHtml( renderData, renderProducts );
    }

    function renderProducts( html ) {
        $( '.section-inStock .section-store-container' ).html( html );
        $( '.section-outStock .section-store-container' ).html( html );
        $( '.section-store-container' ).slimScroll({
            height: '97%'
        });
        $( '.section-outStock .section-title' ).on( 'click', function() {
            log( "detected click on store text" );
            $( this ).parent().toggleClass( 'collapse' );
            $( this ).parent().find( '.section-store-container' ).slideToggle( 'fast' );
            $( this ).find( '.icon-chevron-right' ).toggle();
            $( this ).find( '.icon-chevron-down' ).toggle();
            $( '.section-inStock' ).click();

        });
        $( '.section-inStock .section-title' ).on( 'click', function() {
            log( "detected click on store text" );
            $( this ).parent().toggleClass( 'collapse' );
            $( this ).parent().find( '.section-store-container' ).slideToggle( 'fast' );
            $( this ).find( '.icon-chevron-right' ).toggle();
            $( this ).find( '.icon-chevron-down' ).toggle();
            $( '.section-outStock' ).click();
        });
        $( '.section-inStock .section-title' ).click();
        getFilters();

    }

    function bindEvents() {

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
    google.maps.event.addDomListener( window, 'load', productController.init );
});
