var mainData = ( function() {

    var hasData, processedData, queueData, queuedCallback;

    var settings = {
        dataUrl : '/scripts/data.json'
    };

    /**
     * [retreiveData description]
     * @return {[type]} [description]
     */
    function retreiveData() {
        $.getJSON( setting.dataUrl, function( data ) {
            hasData = true;
        });
    }

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

})();
