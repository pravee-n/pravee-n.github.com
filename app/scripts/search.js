var google = google || {};

/**
 * SINGLETON
 *
 * Main controller responsible for handling all the actions related
 * to the SEARCH VIEW
 */
var searchController = ( function(){

    var fillMapController,
        mapInstance,
        currentData,
        productHandler,
        filterHandler,
        shortlistTemplate,
        isShortlistCompiled,
        shortlistRenderQueue,
        shortlistRenderCallback;

    var log = bows( 'searchContoller' );

    /**
     * Contains all DOM references to be used by this module.
     * @type {Object}
     */
    var messages = {
        mapLoad : 'Map Loaded',
        bindEvent : 'Binding DOM events of filters',
        filterInitialize : 'initalizing filters'
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
        mapCenterAddress  : 'India Gate, New Delhi',
        mapContainer      : 'map-canvas',
        filterDataUrl     : '/scripts/filter.json',
        shortlistTemplate : 'scripts/templates/shortlistList.template'
    };


    var dom = {
        filterItem                 : '.js-filter-item',
        filterDropdownList         : '.js-filter-item-dropdown',
        filterDropdownMoreList     : '.js-more-filter-item-dropdown',
        filterDropdownIcon         : '.js-filter-item-dropdown-icon',
        filterStatus               : '.js-filter-item-status',
        filterContainer            : '.js-search-filter-item-container',
        productMenuAll             : '.js-product-menu-item-products',
        productMenuShortlist       : '.js-product-menu-item-shortlist',
        shortlistProductsContainer : '.js-product-list-shortlisted',
        collapsedProductsContainer : '.js-product-list-collapsed',
        expandedProductsContainer  : '.js-product-list-expanded',
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
     * Initialize the product handler module. This would be responsible for rendering the
     * product list on the left.
     * @param  {Object} data Contains the list of products
     */
    function initializeProductHandler( data ) {
        log( 'initialize product handler module' );
        productHandler = new YProducts();
        var renderData = {};
        renderData.products = data;
        productHandler.getHtml( renderData, renderProducts );
        loadExpandedProducts( data );
    }

    /**
     * Render the product list.
     * @param  {String} html contains the html of all the product item blocks.
     */
    function renderProducts( html ) {
        log( 'render the products and bind various, events' );
        $( '.search-product-inner' ).html( html );
    }

    /**
     * initialize the loading of expanded products
     * @param  {Object} data  data for the expanded products
     */
    function loadExpandedProducts( data ) {
        log( 'loading expanded product handler' );
        var renderData = {};
        renderData.products = data;
        productHandler.getExpandedHtml( renderData, renderExpandedProducts );
    }

    /**
     * render HTML for the expanded product list
     * @param  {String} html html of the expanded list
     */
    function renderExpandedProducts( html ) {
        log( 'rendering the html for expanded list' );
        if ( html ) {
            $( '.js-product-list-expanded' ).html( html );
        } else {
            log( 'did not receive html to render' );
        }
        productHandler.activate();
    }

    /**
     * Toggle product list between collapsd and expanded
     */
    function toggleProductList() {
        $( '.js-products-container' ).toggleClass( 'search-product-expanded' );
        $( '.js-product-list-collapsed' ).parent().toggle();
        $( '.js-product-list-expanded' ).toggle();
        $( '.js-product-menu-container' ).toggle();
    }

    /**
     * Bind various DOM events
     */
    function bindEvents() {
        $( '.js-product-block-expand' ).on( 'click', function() {
            $( this ).toggleClass( 'open' );
            toggleProductList();
        });

        $( 'body' ).on( 'setActiveProduct', function() {
            var isExpanded = $( '.js-products-container' ).hasClass( 'search-product-expanded' );
            if ( isExpanded ) {
                toggleProductList();
            }
        });

        $( '.js-product-list-expanded, .js-product-list-collapsed' ).slimScroll({
            height: 'auto'
        });

        $( dom.productMenuShortlist ).on( 'click', function() {
            showShortlist();
        });

        $( dom.productMenuAll ).on( 'click', function() {
            showProducts();
        });

        $( 'body' ).bind( 'YFilterReady', function() {

            var html = filterHandler.getHtml();

            $( dom.filterContainer ).prepend( html );
            filterHandler.activate();

            $( 'input' ).iCheck({
                checkboxClass: 'icheckbox_flat-red',
                radioClass: 'iradio_flat-red'
            });

            $( dom.filterContainer ).slideDown( 'slow' );

            // $( '.more-filter-item-list' ).on( "click", function() {
            //     var html = $( this ).find( '.more-filter-item-options' ).html();
            //     $( '.more-filter-option-container-inner' ).html( html );
            // });

            $( dom.filterItem ).on( 'mouseenter', function() {
                $( dom.filterItem ).not(this).removeClass( 'selected' ).find( dom.filterDropdownList ).slideUp( 'fast' );
                $( this ).addClass( 'selected' );
                $( this ).find( dom.filterDropdownList ).slideDown( 'fast' );
            });

            $( dom.filterItem ).on( 'mouseleave', function() {
                $( dom.filterItem ).not(this).removeClass( 'selected' ).find( dom.filterDropdownList ).slideUp( 'fast' );
                $( this ).removeClass( 'selected' );
                $( this ).find( dom.filterDropdownList ).slideUp( 'fast' );
            });

            $( dom.filterDropdownList ).on( 'click', function( event ) {
                event.stopPropagation();
            });
        });
    }

    /**
     * load all the templates used by this module
     */
    function preloadTemplate() {
        $.ajax({
            type     : 'GET',
            url      : settings.shortlistTemplate,
            success  : function( template ) {
                log( 'loaded shortlist template' );
                shortlistTemplate = Handlebars.compile( template );
                isShortlistCompiled = true;
                if ( shortlistRenderQueue ) {
                    showShortlist();
                }
            }
        });
    }

    /**
     * show the shortlisted items list
     */
    function showShortlist() {
        var shortlistedItems = YShortlist.getList();
        if( isShortlistCompiled ) {
            var html = shortlistTemplate( shortlistedItems );
            $( dom.shortlistProductsContainer ).html( html );
            $( dom.productMenuAll ).removeClass( 'selected' );
            $( dom.productMenuShortlist ).addClass( 'selected' );
            $( dom.collapsedProductsContainer ).hide();
            $( dom.shortlistProductsContainer ).show();
        } else {
            shortlistRenderQueue = true;
        }
    }

    /**
     * show products item list
     */
    function showProducts() {
        $( dom.productMenuAll ).addClass( 'selected' );
        $( dom.productMenuShortlist ).removeClass( 'selected' );
        $( dom.collapsedProductsContainer ).show();
        $( dom.shortlistProductsContainer ).hide();
    }

    /**
     * initialize the search view Controller
     */
    function init() {
        initializeMap();
        log( messages.filterInitialize );
        filterHandler = new YFilter( settings.filterDataUrl );
        preloadTemplate();
        bindEvents();
    }

    return {
        init : init
    };

})();


$( document ).ready( function() {
    google.maps.event.addDomListener( window, 'load', searchController.init );
});
