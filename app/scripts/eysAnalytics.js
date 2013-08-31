
var YAnalytics = (function() {

    var isInitialized = false;
    var userObject = {};

    function initialize() {
        analytics.initialize({
            'Google Analytics' : 'UA-43563243-1',
            'Mixpanel' : {
                token : '07b507cdce57a4903fbce4ce75e3e260',
                people : true
            }
        });
    }

    function setupUser() {
        if ( $( '.js-analytics-user' ).length > 0 ) {
            userObject.email = $( '.js-analytics-user .user-name' ).text();
            userObject.id = $( '.js-analytics-user .company-id' ).text();
            userObject.name = $( '.js-analytics-user .company-name' ).text();
            userObject.pic = $( '.js-analytics-user .company-pic' ).text();
            $( '.js-analytics-user' ).remove();
            identify();
        }
    }

    function identify() {
        if ( userObject && userObject !== "null" && userObject !== "undefined" ) {
            analytics.identify( userObject.id, {
                email: userObject.email,
                name: userObject.name,
                profilePic : userObject.pic
            });
        }
    }

    function track( message, object ) {
        if ( object === undefined ) {
            object = {};
        }
        analytics.track(message, object );
    }

    (function init() {
        initialize();
    })();

    return {
        track: track,
        setupUser : setupUser
    };
})();
