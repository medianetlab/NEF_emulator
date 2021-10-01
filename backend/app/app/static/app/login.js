// ================== Global variables ==================

var api_url  = "/api/v1"
var username = "";
var password = "";
var local_storage_available = false;

// ======================================================





$( document ).ready(function() {

    // check if local storage is available
    // updates `local_storage_available` variable
    test_local_storage();


    $('#btn-login').on('click',function(){
        username = $('#input-user').val();
        password = $('#input-pass').val();

        api_login_access_token( username , password );
    });
});


function api_login_access_token(user , pass) {
    var url = api_url + '/login/access-token';
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
        success: function(data)
        {
            app_login(data);
        },
        error: function(err)
        {
            ui_show_login_error(err);
        },
        timeout: 5000
    });
}



function app_login( token_data ) {
    // console.log(data);
    if (local_storage_available) {
        localStorage.setItem('app_auth', JSON.stringify(token_data));
        window.location.href = [location.protocol, '//', location.host, "/home"].join('');
    }
}


function ui_show_login_error(err) {
    // console.log(err);
    $('.login-notifications small').text(err.responseJSON.detail);
}




function test_local_storage(){
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        local_storage_available = true;
    } catch(e) {
        local_storage_available = false;
    }
}