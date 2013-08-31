/**
 * Module responsible for handling filters.
 * Based on the given data, the module combines various templates
 * of the filter to generate the final HTML.
 */
var YFilter = function( url ) {

    // Declaring all the variables to be used by this module.
    var hasData,
        processedData,
        queueData,
        queuedCallback,
        rawData,
        templateList,
        generatedHtml;

    processedData = {};
    var log = bows( 'filter' );
    var self = this;

    var dom = {
        filterItem                 : '.js-filter-item',
        filterDropdownList         : '.js-filter-item-dropdown',
        filterDropdownMoreList     : '.js-more-filter-item-dropdown',
        filterDropdownIcon         : '.js-filter-item-dropdown-icon',
        filterStatus               : '.js-filter-item-status',
        filterContainer            : '.js-search-filter-item-container',
    };

    /**
     * settings object
     * @type {Object}
     */
    var settings = {
        dataUrl   : 'scripts/filter.json',
        templates : {
            multiSelect : {
                url        : 'scripts/templates/dropdownFilter.template',
                isCompiled : false
            },
            moreFilter : {
                url        : 'scripts/templates/moreFilter.template',
                isCompiled : false
            },
            slider : {
                url        : 'scripts/templates/sliderFilter.template',
                isCompiled : false
            }
        }
    };

    /**
     * Logging messages for this module
     * @type {Object}
     */
    var messages = {
        fetchedData      : 'Received data from the server',
        noRawData        : 'No raw data exists',
        dataProcessed    : 'Processed Data',
        url              : 'No URL provided while initialization. Resorting to the default URL',
        noFilterType     : 'Filter type not specified for filter ',
        noFilterTemplate : 'No filter template found for the filter type '
    };

    /**
     * retreive data from the server.
     */
    function retreiveData() {

        $.getJSON( settings.dataUrl, function( data ) {
            hasData = true;
            rawData = data;
            log( messages.fetchedData );
            preLoadTemplates();
        });
    }

    /**
     * Preload all the filter templates
     */
    function preLoadTemplates() {
        log( 'precompiledTemplate' );
        var templatesLength = Object.keys( templateList ).length;
        for( var templateIndex in templateList ) {
            var currentTemplate = templateList[ templateIndex ];
            templatesLength--;
            $.ajax({
                type     : "GET",
                url      : currentTemplate.url,
                context  : {
                    currentTemplate : currentTemplate,
                    templatesLength : templatesLength
                },
                success  : function( template ) {
                    this.currentTemplate.precompiledTemplate = Handlebars.compile( template );
                    this.currentTemplate.isCompiled = true;
                    if ( this.templatesLength === 0 ) {
                        generateFilterHtml();
                    }
                }
            });
        }
    }

    /**
     * generate the more filter box
     */
    function generateMoreFilterBox() {
        var template = templateList.moreFilter;
        var secondaryFilters = rawData.secondary;
        var renderData = {};
        renderData.data = secondaryFilters;
        var moreFilterHtml = template.precompiledTemplate( renderData );
        generatedHtml+= moreFilterHtml;
        $( 'body' ).trigger( 'YFilterReady' );
    }

    /**
     * generate Filter bar
     */
    function generateFilterBar() {
        var primaryFilters = rawData.primary;
        var filterBarHtml = '';
        for ( var primaryIndex in primaryFilters ) {
            var filter = primaryFilters[ primaryIndex ];
            if ( filter.hasOwnProperty( 'type' ) ) {
                if ( templateList.hasOwnProperty( filter.type ) ) {
                    var template = templateList[ filter.type ];
                    if( template.isCompiled ) {
                        var html = template.precompiledTemplate( filter );
                        filterBarHtml+= html;
                    }
                } else {
                    log( messages.noFilterTemplate + filter.type );
                }
            } else {
                log( messages.noFilterType + filter.name );
            }
        }
        generatedHtml += filterBarHtml;
        generateMoreFilterBox();
    }

    /**
     * initialize generation of HTML
     */
    function generateFilterHtml() {
        log( 'generateFilterHtml' );
        generateFilterBar();
    }

    function generateSliders(){
        $( '.js-filter-slider' ).each( function() {
            var start = $( this ).find( '.js-slider-start').text();
            var end   = $( this ).find( '.js-slider-end').text();
            var step  = $( this ).find( '.js-slider-step').text();
            start = parseInt( start, 10 );
            end   = parseInt( end, 10 );
            step  = parseInt( step, 10 );
            $( this ).find( '.js-filter-slider-data' ).remove();
            $( this ).find( '.js-filter-slider-canvas' ).noUiSlider({
                range   : [ start, end ],
                start   : 0,
                step    : step,
                handles : 1,
                slide   : function() {
                    var value = $( this ).val();
                    $( this ).siblings( '.js-filter-slider-label' ).text( value );
                }
            });
        });
    }

    /**
     * PUBLIC
     *
     * Returns the final HTML.
     * @return {String} Final HTML
     */
    function getHtml() {
        return generatedHtml;
    }


    /**
     * PUBLIC
     *
     * Bind various events corresponding to filters after they are inserted.
     */
    function activate() {
        log( 'activating filters' );
        $( 'input' ).iCheck({
            checkboxClass: 'icheckbox_flat-red',
            radioClass: 'iradio_flat-red'
        });

        $( dom.filterContainer ).slideDown( 'slow' );

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

        generateSliders();
    }

    /**
     * initialization function
     */
    (function init() {
        if ( url ) {
            settings.url = url;
        } else {
            log( messages.noUrl );
        }
        retreiveData();
        templateList = settings.templates;
        generatedHtml = '';
    })();

    return {
        getHtml : getHtml,
        activate : activate
    };

};
