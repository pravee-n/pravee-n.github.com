var google = google || {};

var searchController = ( function(){

    var fillMapController, mapInstance, currentData, productHandler;

    var log = bows( 'searchContoller' );

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

    function renderMap( data ) {
        log( data );
        fillMapController = new FillMap( mapInstance, data );
    }


    function getData() {
        mainData.getStores( renderMap );
        mainData.getProducts( initializeProductHandler );
    }

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

            $( '.filter-item' ).on( 'click', function() {
                $( '.filter-item' ).not(this).removeClass( 'selected' ).find( '.filter-item-list' ).slideUp( 'fast' );
                $( this ).toggleClass( 'selected' );
                $( this ).find( '.filter-item-list' ).slideToggle( 'fast' );
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

    function initializeProductHandler( data ) {
        productHandler = new YProducts();
        var renderData = {};
        renderData.products = data;
        productHandler.getHtml( renderData, renderProducts );
    }

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
