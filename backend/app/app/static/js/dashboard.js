var gNBs  = null;
var cells = null;
var ues   = null;
var paths = null;

$( document ).ready(function() {
    api_get_gNBs();
    api_get_Cells()
    api_get_UEs()
    api_get_paths()
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
        beforeSend: function() {
            $('.card-gNBs .spinner-grow-sm').show();
        },
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
        complete: function()
        {
            $('.card-gNBs .spinner-grow-sm').hide();
        },
        timeout: 5000
    });
}


function api_get_Cells() {
    
    var url = app.api_url + '/Cells/?skip=0&limit=100';

    $.ajax({
        type: 'GET',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        processData:  false,
        beforeSend: function() {
            $('.card-cells .spinner-grow-sm').show();
        },
        success: function(data)
        {
            console.log(data);
            cells = data;
            ui_update_card( '#num-cells-card' , cells.length );
        },
        error: function(err)
        {
            console.log(err);
        },
        complete: function()
        {
            $('.card-cells .spinner-grow-sm').hide();
        },
        timeout: 5000
    });
}



function api_get_UEs() {
    
    var url = app.api_url + '/UEs/?skip=0&limit=100';

    $.ajax({
        type: 'GET',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        processData:  false,
        beforeSend: function() {
            $('.card-ues .spinner-grow-sm').show();
        },
        success: function(data)
        {
            console.log(data);
            ues = data;
            ui_update_card( '#num-UEs-card' , ues.length );
        },
        error: function(err)
        {
            console.log(err);
        },
        complete: function()
        {
            $('.card-ues .spinner-grow-sm').hide();
        },
        timeout: 5000
    });
}


function api_get_paths() {
    
    var url = app.api_url + '/frontend/location/?skip=0&limit=100';

    $.ajax({
        type: 'GET',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        processData:  false,
        beforeSend: function() {
            $('.card-paths .spinner-grow-sm').show();
        },
        success: function(data)
        {
            console.log(data);
            paths = data;
            ui_update_card( '#num-paths-card' , paths.length );
        },
        error: function(err)
        {
            console.log(err);
        },
        complete: function()
        {
            $('.card-paths .spinner-grow-sm').hide();
        },
        timeout: 5000
    });
}



function ui_update_card( element_id, number ) {
    $( element_id ).html(number);
}