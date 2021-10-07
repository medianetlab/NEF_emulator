var gNBs = null;

$( document ).ready(function() {
    api_get_gNBs();
    
});




function api_get_gNBs() {
    
    var url = app.api_url + '/gNBs/?skip=0&limit=100';

    $.ajax({
        type: 'GET',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        processData:  false,
        success: function(data)
        {
            console.log(data);
            gNBs = data;
            ui_update_card( '#num-gnbs-card' , gNBs.length );
        },
        error: function(err)
        {
            console.log(err);
        },
        timeout: 5000
    });
}


function ui_update_card( element_id, number ) {
    $( element_id ).html(number);
}