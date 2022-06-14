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
    api_url: "/api/v1",
    default_redirect: "/dashboard"
};

// ======================================================




$( document ).ready(function() {
    
    // check if local storage is available &
    // update `local_storage_available` variable
    app_test_browser_local_storage();

    // initialize auth_obj
    if (app.local_storage_available) {
        app.auth_obj = JSON.parse(localStorage.getItem('app_auth'));

        if ( app.auth_obj == null ) {
            // if you the token is null
            // check if you are already at the /login page
            if (location.pathname != "/login") {
                // if not, redirect to /login
                window.location.href = [location.protocol, '//', location.host, "/login"].join('');    
            }
            
        } else {
            // use the API to test the token found
            // to check that it is valid
            api_test_token( app.auth_obj.access_token );
        }
    }

    ui_initialize_btn_listeners();

});





// ================= App Functions Area =================
// 
function app_test_browser_local_storage(){
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        app.local_storage_available = true;
    } catch(e) {
        app.local_storage_available = false;
    }
}




function app_login( token_data ) {
    // console.log(data);
    if (app.local_storage_available) {
        localStorage.setItem('app_auth', JSON.stringify(token_data));
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
            if (location.pathname == "/login") {
                window.location.href = [location.protocol, '//', location.host, app.default_redirect].join('');    
            } 
        },
        error: function(err)
        {
            window.location.href = [location.protocol, '//', location.host, "/login"].join('');
        },
        timeout: 5000
    });
}




function api_login_access_token(user , pass) {
    var url = app.api_url + '/login/access-token';
    var data = {
        "grant_type"   : "",
        "username"     : user,
        "password"     : pass,
        "scope"        : "",
        "client_id"    : "",
        "client_secret":""
    };

    $.ajax({
        type: 'POST',
        url:  url,
        contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
        data:         data,
        processData:  true,
        beforeSend: function() {
            $('.spinner-grow-sm').show();
            $('.login-notifications .text-secondary').text("Checking user authentication...");
        },
        success: function(data)
        {
            app_login(data);
            ui_show_login_success();
        },
        error: function(err)
        {
            ui_show_login_error(err);
        },
        complete: function()
        {
            $('.spinner-grow-sm').hide();
        },
        timeout: 5000
    });
}




function ui_initialize_btn_listeners() {
    $('#logout-btn').on("click",function(event){
        event.preventDefault();
        localStorage.removeItem('app_auth');
        window.location.href = [location.protocol, '//', location.host].join('');
    });
}