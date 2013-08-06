var YFilter = function( url ) {

    var hasData, processedData, queueData, queuedCallback, rawData, templateList, generatedHtml;
    processedData = {};
    var log = bows( 'filter' );
    var self = this;

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
            }
        }
    };



    var messages = {
        fetchedData   : 'Received data from the server',
        noRawData     : 'No raw data exists',
        dataProcessed : 'Processed Data',
        url           : 'No URL provided while initialization. Resorting to the default URL',
        noFilterType  : 'Filter type not specified for filter ',
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

    function generateMoreFilterBox() {
        var template = templateList.moreFilter;
        var secondaryFilters = rawData.secondary;
        var renderData = {};
        renderData.data = secondaryFilters;
        var moreFilterHtml = template.precompiledTemplate( renderData );
        generatedHtml+= moreFilterHtml;
        $( 'body' ).trigger( 'YFilterReady' );
    }




    function generateFilterBar() {
        var primaryFilters = rawData.primary;
        var filterBarHtml = '';
        for ( var primaryIndex in primaryFilters ) {
            log( primaryIndex );
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


    function generateFilterHtml() {
        log( 'generateFilterHtml' );
        generateFilterBar();
    }

    function getHtml() {
        return generatedHtml;
    }


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
        getHtml : getHtml
    };

};
