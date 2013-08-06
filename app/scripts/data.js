var mainData = ( function() {

    var hasData, processedData, queueData, queuedCallback, rawData;
    processedData = {};
    var log = bows( 'data' );

    var messages = {
        fetchedData   : 'Received data from the server',
        noRawData     : 'No raw data exists',
        dataProcessed : 'Processed Data',
        requestedProductDetails : 'Requested data for product ',
        noProductId : 'No product id',
        noCallback : 'Requested data but no callback provided'
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

    function getProducts( callback ) {
        if ( processedData && processedData.hasOwnProperty( 'allProducts' ) ) {
            callback( processedData.allProducts );
        }
    }

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


    function getStores( callback ) {
        if ( processedData && processedData.hasOwnProperty( 'allStores' ) ) {
            callback( processedData.allStores );
        }
    }


    /**
     * Function to return data.
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
