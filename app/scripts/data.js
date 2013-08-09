var mainData = ( function() {

    var hasData, processedData, queueData, queuedCallback, rawData;
    processedData = {};
    var log = bows( 'data' );

    var messages = {
        fetchedData             : 'Received data from the server',
        noRawData               : 'No raw data exists',
        dataProcessed           : 'Processed Data',
        requestedProductDetails : 'Requested data for product ',
        noProductId             : 'No product id',
        noCallback              : 'Requested data but no callback provided'
    };


    var settings = {
        dataUrl : 'scripts/data.json'
    };

    /**
     * retreive data from the server.
     */
    function retreiveData() {
        $.getJSON( settings.dataUrl, function( data ) {
            hasData = true;
            rawData = data;
            processData();
            log( messages.fetchedData );
        });
    }


    /**
     * Process raw data and make an array of stores
     */
    function processData() {
        if ( rawData ) {
            var allProducts = rawData.result;
            var storeArray = [];
            var flaggedStoreId = {};
            for ( var item in allProducts ) {
                var productStores = allProducts[ item ].stores;
                for ( var storeIterator in productStores ) {
                    var store = productStores[ storeIterator ];
                    if ( !flaggedStoreId.hasOwnProperty( store.id ) && !flaggedStoreId[ store.id] ) {
                        flaggedStoreId[ store.id ] = true;
                        storeArray.push( store );
                    }
                }
            }
            processedData.allProducts = rawData.result;
            processedData.allStores = storeArray;
            log( processedData );
            log( messages.dataProcessed );
        } else {
            log( messages.noRawData );
        }
    }

    /**
     * Get all products.
     * @param  {Function} callback Callback to be fired
     */
    function getProducts( callback ) {
        if ( processedData && processedData.hasOwnProperty( 'allProducts' ) ) {
            callback( processedData.allProducts );
        }
    }


    /**
     * Get details and stores of a single product.
     * @param  {String}   id       product ID for which the dat needs to be returned
     * @param  {Function} callback callback function.
     */
    function getProductObject( id, callback ) {
        log( messages.requestedProductDetails );
        if( id ) {
            log( 'id : ' + id );
            var productToReturn;
            var data = rawData.result;
            for( var key in data ){
                var product = data[ key ];
                if( product.id === id ) {
                    productToReturn = product;
                }
            }
            callback( productToReturn );
        } else {
            log( messages.noProductId );
        }
    }


    /**
     * Get all the stores
     * @param  {Function} callback Callback function
     */
    function getStores( callback ) {
        if ( processedData && processedData.hasOwnProperty( 'allStores' ) ) {
            callback( processedData.allStores );
        }
    }


    /**
     * Function to return all data. Should not be called. If some content is required and the current
     * function do not support it, then the API should be extended with a new function like
     * getProductObject, getStores etc.
     * @param  Function     callback    Callback function to be passed when data is processed.
     * @return Object     data Object
     */
    function getData( callback ) {
        if ( hasData ) {
            callback( processedData );
        } else {
            queueData = true;
            queuedCallback = callback;
        }
    }

    (function init() {
        retreiveData();
    })();

    return {
        getProducts : getProducts,
        getStores   : getStores,
        getProductObject : getProductObject
    };

})();
