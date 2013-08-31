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
        mapLoad             : 'Map Loaded',
        bindEvent           : 'Binding DOM events of filters',
        filterInitialize    : 'initalizing filters',
        productInitialize   : 'initialized product handler',
        renderProducts      : 'render the products',
        loadExpanded        : 'loading expanded product container',
        renderExpanded      : 'rendering the expanded products list',
        noHtml              : 'did not receive HTML to render',
        switchedProductView : 'swithing product view',
        showShortlist       : 'loading shortlisted items',
        shortlistQueued     : 'shotlist template not loaded, queued request'
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
        shortlistListItem          : '.js-shortlist-list-item',
        productsContainer          : '.js-products-container',
        productMenuContainer       : '.js-product-menu-container',
        expandButton               : '.js-product-block-expand',
        mapContainer               : '.js-map-container',
        productMenuCount           : '.js-product-value'
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
        NProgress.done();
        fillMapController = new FillMap( mapInstance, data );
    }

    /**
     * Get all the data required by this module. Preloading data for a better experience
     * for the user.
     */
    function getData() {
        NProgress.start();
        mainData.getStores( renderMap );
        mainData.getProducts( initializeProductHandler );
    }

    /**
     * Initialize the product handler module. This would be responsible for rendering the
     * product list on the left.
     * @param  {Object} data Contains the list of products
     */
    function initializeProductHandler( data ) {
        log( messages.productInitialize );
        YNotification.show( 'Loading Products' );
        productHandler = new YProducts();
        var renderData = {};
        renderData.products = data;
        var productCount = data.length;
        $( dom.productMenuCount ).text( productCount );
        productHandler.getHtml( renderData, renderProducts );
        loadExpandedProducts( data );
    }

    /**
     * Render the product list.
     * @param  {String} html contains the html of all the product item blocks.
     */
    function renderProducts( html ) {
        log( messages.renderProducts );
        YNotification.end( 'Loading Products' );
        $( dom.collapsedProductsContainer ).html( html );
        productHandler.activate();
    }

    /**
     * initialize the loading of expanded products
     * @param  {Object} data  data for the expanded products
     */
    function loadExpandedProducts( data ) {
        log( messages.loadExpanded );
        var renderData = {};
        renderData.products = data;
        productHandler.getExpandedHtml( renderData, renderExpandedProducts );
    }

    /**
     * render HTML for the expanded product list
     * @param  {String} html html of the expanded list
     */
    function renderExpandedProducts( html ) {
        log( messages.renderExpanded );
        if ( html ) {
            $( dom.expandedProductsContainer ).html( html );
            bindEvents();
        } else {
            log( messages.noHtml );
        }
    }

    /**
     * Toggle product list between collapsd and expanded
     */
    function toggleProductList() {
        log( messages.switchedProductView );
        $( dom.productsContainer ).toggleClass( 'search-product-expanded' );
        $( dom.collapsedProductsContainer ).parent().toggle();
        $( dom.expandedProductsContainer ).toggle();
        $( dom.productMenuContainer ).toggle();
    }

    /**
     * Bind various DOM events
     */
    function bindEvents() {
        $( dom.expandButton ).on( 'click', function() {
            $( this ).toggleClass( 'open' );
            YAnalytics.track('switched product list view' );
            toggleProductList();
        });

        $( 'body' ).on( 'setActiveProduct', function() {
            var isExpanded = $( dom.productsContainer ).hasClass( 'search-product-expanded' );
            if ( isExpanded ) {
                toggleProductList();
            }
        });

        $( dom.collapsedProductsContainer + ', ' +  dom.expandedProductsContainer).slimScroll({
            height: 'auto'
        });

        $( dom.productMenuShortlist ).on( 'click', function() {
            showShortlist();
        });

        $( dom.productMenuAll ).on( 'click', function() {
            showProducts();
        });

        $( dom.shortlistProductsContainer ).on( 'click', dom.shortlistListItem, function() {
            var id = $( this ).attr( "data-id" );
            fillMapController.activateMarker( id );
        });

        $( dom.filterItem ).hoverIntent(function( evt ) {
            if (evt.type === 'mouseenter') {
                $( dom.filterItem ).not(this).removeClass( 'selected' ).find( dom.filterDropdownList ).slideUp( 'fast' );
                $( this ).addClass( 'selected' );
                $( this ).find( dom.filterDropdownList ).slideDown( 'fast' );
            }
        });

        $( dom.filterItem ).on( 'mouseleave', function() {
            $( dom.filterItem ).not(this).removeClass( 'selected' ).find( dom.filterDropdownList ).slideUp( 'fast' );
            $( this ).removeClass( 'selected' );
            $( this ).find( dom.filterDropdownList ).slideUp( 'fast' );
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
        YAnalytics.track( 'viewed shortlist' );
        log( messages.showShortlist );
        var shortlistedItems = YShortlist.getList();
        if( isShortlistCompiled ) {
            var html = shortlistTemplate( shortlistedItems );
            if( shortlistedItems.length > 0 ) {
                $( dom.shortlistProductsContainer ).html( html );
            }
            $( dom.productMenuAll ).removeClass( 'selected' );
            $( dom.productMenuShortlist ).addClass( 'selected' );
            $( dom.collapsedProductsContainer ).hide();
            $( dom.shortlistProductsContainer ).show();
            fillMapController.showShortlist();
        } else {
            log( messages.shortlistQueued );
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
        fillMapController.showProducts();
    }

    /**
     * initialize the search view Controller
     */
    function init() {
        initializeMap();
        NProgress.configure({ appendContainer: dom.mapContainer });
        log( messages.filterInitialize );
        YAnalytics.track( 'viewed Search' );
        filterHandler = new YFilter( settings.filterDataUrl );
        $( 'body' ).bind( 'YFilterReady', function() {
            var html = filterHandler.getHtml();
            $( dom.filterContainer ).prepend( html );
            filterHandler.activate();
        });

        preloadTemplate();
    }

    return {
        init : init
    };

})();


$( document ).ready( function() {
    analytics.ready(function () {
        analytics.pageview();
    });
    google.maps.event.addDomListener( window, 'load', searchController.init );
});
