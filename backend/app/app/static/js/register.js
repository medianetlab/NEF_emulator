// ================== Global variables ==================

var api_url  = "/api/v1"
var username = "";
var password = "";
var email    = "";

// ======================================================





$( document ).ready(function() {

    // submit when button is clicked...
    $('#btn-register').on('click',function(){
        ui_submit_register();
    });


    // also submit when the user just hits "enter"
    $(".card-body input").keypress(function(event) {
        if(event && event.keyCode == 13) {
            ui_submit_register();
        }
    });
});


function api_create_user_open() {
    var url = api_url + '/users/open';
    var data = {
        "email": email,
        "full_name": username,
        "password": password
    };

    $.ajax({
        type: 'POST',
        url:  url,
        contentType : 'application/json',
        data:         JSON.stringify(data),
        processData:  false,
        beforeSend: function() {
            $('.spinner-grow-sm').show();
            $('.register-notifications .text-secondary').text("Creating user...");
        },
        success: function(data)
        {
            ui_show_register_success();
        },
        error: function(err)
        {
            ui_show_register_error(err);
        },
        complete: function()
        {
            $('.spinner-grow-sm').hide();
        },
        timeout: 5000
    });
}



function ui_submit_register() {
    username  = $('#input-user').val();
    email     = $('#input-email').val();
    password  = $('#input-pass').val();
    password2 = $('#input-pass-repeat').val();

    // remove previous notifications when button is clicked
    $('.register-notifications .text-secondary').text("");
    $('.register-notifications .text-danger').text("");

    // UI pre-checks
    if (
        (username == "") ||
        (email    == "") ||
        (password == "") ||
        (password2== ""))
    {
        ui_show_precheck_error("Some input fields are empty.");
        return;
    }
    if (password != password2) {
        ui_show_precheck_error("Oups! The two passwords you typed don't match.");
        return;
    }
    if (!validateEmail( email )) {
        ui_show_precheck_error("Psst! The email you typed is not valid.");
        return;
    }

    api_create_user_open();
}



function ui_show_precheck_error( info ) {
    $('.register-notifications .text-danger').text( info );
}




function ui_show_register_error(err) {
    console.log(err);
    $('.register-notifications .text-danger').text(err.responseJSON.detail);
    $('.register-notifications .text-secondary').text("");
}

function ui_show_register_success() {
    $('.register-notifications .text-secondary').text("Successfully created new user!");
}



function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}