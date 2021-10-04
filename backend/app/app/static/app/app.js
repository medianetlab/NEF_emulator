// 
// This .js file is intended to be used by all pages of the app.
// Functionality:
//   - check local storage:
//       - if no bearer token is found --> redirect to unauthorized page
//       - if    bearer token is found --> test its validity
//   - if local storage has valid token, continue rendering the page
// 


// ================== Global variables ==================

var app = {
    local_storage_available: false,
    auth_obj:                null,
    api_url: "/api/v1"
};

// ======================================================




$( document ).ready(function() {
    
    // check if local storage is available &
    // update `local_storage_available` variable
    browser_test_local_storage();

    console.log("document ready");

    // initialize auth_obj
    if (app.local_storage_available) {
        app.auth_obj = JSON.parse(localStorage.getItem('app_auth'));

        if ( app.auth_obj == null ) {
            // if you can't find a token redirect to login page
            window.location.href = [location.protocol, '//', location.host, "/login"].join('');
        } else {
            // use the API to test the token found
            // to check that it is valid
            api_test_token( app.auth_obj.access_token );
        }
    }

});





// ================== Functions Area ==================
// 
function browser_test_local_storage(){
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        app.local_storage_available = true;
    } catch(e) {
        app.local_storage_available = false;
    }
}



// ================== Ajax Calls Area ==================
//

function api_test_token( token_str ){
    var url = app.api_url + '/login/test-token';

    $.ajax({
        type: 'POST',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + token_str
        },
        processData:  false,
        success: function(data)
        {
            // 
        },
        error: function(err)
        {
            window.location.href = [location.protocol, '//', location.host, "/login"].join('');
        },
        timeout: 5000
    });
}