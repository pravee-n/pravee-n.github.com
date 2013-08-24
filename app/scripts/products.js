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
        mainContainer         : '.js-product-item',
        expandContainer       : '.js-product-expand-container',
        infoContainer         : '.js-product-info',
        itemContainerExpanded : '.js-product-expanded-item'
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
            $( '.active' ).not( this ).removeClass( 'active' );
            $( this ).toggleClass( 'active' );
            var id = $( this ).attr( "data-id" );
            EYS.setActiveProduct( id );
        });

        $( dom.infoContainer ).on( 'click', function() {
            $( '.active-drawar' ).removeClass( 'active-drawar' );
            $( this ).siblings( dom.expandContainer ).toggleClass( 'active-drawar' );

            $( dom.expandContainer ).not( '.active-drawar' ).slideUp( 'fast' );

            $( this ).siblings( dom.expandContainer ).slideToggle( 'fast' );
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
