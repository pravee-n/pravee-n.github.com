/**
 * CONSTRUCTOR
 *
 * Responsible for populating the list in the sidebar.
 *
 *
 */

var YProducts = function() {

    var compiledTemplate,
        compiledTemplateExpanded,
        isCompiled,
        isCompiledExpanded,
        renderQueue,
        renderQueueExpanded,
        renderCallback,
        renderCallbackExpanded,
        renderData;

    var log = bows( 'YProducts' );

    /**
     * settings object
     */
    var settings = {
        template          : 'scripts/templates/productList.template',
        expandedTemplate  : 'scripts/templates/productExpandedList.template'
    };


    /**
     * Contains all DOM references to be used by this module.
     * @type {Object}
     */
    var dom = {
        mainContainer          : '.js-product-item',
        expandContainer        : '.js-product-expand-container',
        infoContainer          : '.js-product-info',
        itemContainerExpanded  : '.js-product-expanded-item',
        filterItem             : '.js-filter-item',
        filterDropdownList     : '.js-filter-item-dropdown',
        filterDropdownMoreList : '.js-more-filter-item-dropdown',
        filterDropdownIcon     : '.js-filter-item-dropdown-icon',
        filterStatus           : '.js-filter-item-status',
        filterContainer        : '.js-search-filter-item-container',
    };


    /**
     * Logging messages for this module
     * @type {Object}
     */
    var messages = {
        init       : 'Initialized YProducts handler',
        getHtml    : 'requested html',
        getExpanded: 'requested html for expanded template',
        noData     : 'requested html, but no data provided. Abort',
        noCallback : 'requested html but no callback provided. Abort'
    };


    (function init() {
        log( messages.init );
        preLoadTemplate();
    })();

    /**
     * PUBLIC
     *
     * Taking care of all the tasks required after insertion of the HTML.
     * Binds various events.
     */
    function activate() {

        $( dom.mainContainer ).on( 'click', function() {
            var id = $( this ).attr( "data-id" );
            EYS.setActiveProduct( id );
        });

        $( 'body' ).on( 'setActiveProduct', function( event ) {
            var matchedElement = $( dom.mainContainer+'[data-id="' + event.id + '"]');
            matchedElement.ScrollTo({
                onlyIfOutside: true
            });
            $( '.active' ).not( matchedElement ).removeClass( 'active' );
            $( matchedElement ).toggleClass( 'active' );
            $( '.active-drawar' ).removeClass( 'active-drawar' );
            $( dom.expandContainer ).not( '.active-drawar' ).slideUp( 'fast' );
            $( matchedElement ).find( dom.infoContainer ).siblings( dom.expandContainer ).toggleClass( 'active-drawar' );
            $( matchedElement ).find( dom.infoContainer ).siblings( dom.expandContainer ).slideToggle( 'fast' );
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

        $( dom.filterDropdownList ).on( 'click', function( event ) {
            event.stopPropagation();
        });

        $( dom.itemContainerExpanded ).on( 'click', function() {
            var id = $( this ).attr( 'data-id' );
            EYS.setActiveProduct( id );
        });
    }

    /**
     * PUBLIC
     * Returns rendered html for the default template.
     * @param  {Object}   data     Data containing information for stores
     * @param  {Function} callback Callback function to send the HTML to
     */
    function getHtml( data, callback ) {
        log( messages.getHtml );
        if( data ) {
            if ( isCompiled ) {
                var html = compiledTemplate( data );
                if ( callback ) {
                    callback ( html );
                } else {
                    log( messages.noCallback );
                }
            } else {
                if ( callback ) {
                    renderQueue = true;
                    renderCallback = callback;
                    renderData = data;
                } else {
                    log( messages.noCallback );
                }
            }
        } else {
            log( messages.noData );
        }
    }


    /**
     * PUBLIC
     * Returns rendered html for the expanded template.
     * @param  {Object}   data     Data containing information for stores
     * @param  {Function} callback Callback function to send the HTML to
     */
    function getExpandedHtml( data, callback ) {
        log( messages.getHtml );
        if( data ) {
            if ( isCompiled ) {
                var html = compiledTemplateExpanded( data );
                if ( callback ) {
                    callback ( html );
                } else {
                    log( messages.noCallback );
                }
            } else {
                if ( callback ) {
                    renderQueueExpanded = true;
                    renderCallbackExpanded = callback;
                    renderData = data;
                } else {
                    log( messages.noCallback );
                }
            }
        } else {
            log( messages.noData );
        }
    }

    /**
     * preload and compile the info box template
     */
    function preLoadTemplate() {
        $.ajax({
            type     : 'GET',
            url      : settings.template,
            success  : function( template ) {
                compiledTemplate = Handlebars.compile( template );
                isCompiled = true;
                if ( renderQueue ) {
                    var html = compiledTemplate( renderData );
                    console.log( renderData );
                    renderCallback( html );
                }
            }
        });

        $.ajax({
            type     : 'GET',
            url      : settings.expandedTemplate,
            success  : function( template ) {
                compiledTemplateExpanded = Handlebars.compile( template );
                isCompiledExpanded = true;
                if ( renderQueueExpanded ) {
                    var html = compiledTemplateExpanded( renderData );
                    renderCallbackExpanded( html );
                }
            }
        });
    }

    return {
        getHtml  : getHtml,
        activate : activate,
        getExpandedHtml : getExpandedHtml
    };

};
