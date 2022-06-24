

$( document ).ready(function() {

    // submit when button is clicked...
    $('#btn-login').on('click',function(){
        ui_submit_login();
    });


    // also submit when the user just hits "enter"
    $(".card-body input").keypress(function(event) {
        if(event && event.keyCode == 13) {
            ui_submit_login();
        }
    });
});



function ui_submit_login() {
    console.log("login pressed");
    username = $('#input-user').val();
    password = $('#input-pass').val();

    api_login_access_token( username , password );
}


function ui_show_login_error(err) {
    console.log(err);
    $('.login-notifications .text-danger').text(err.responseJSON.detail);
}



function ui_show_login_success() {
    $('.login-notifications .text-secondary').text("Successful login, redirecting...");
    setInterval(function(){
        window.location.href = [location.protocol, '//', location.host, "/dashboard"].join('');
    },1200);
}
