// ===============================================
//               Global variables
// ===============================================
var gNBs  = null;
var cells = null;
var ues   = null;
var paths = null;




// ===============================================
//                 Document ready
// ===============================================
$( document ).ready(function() {
    api_get_gNBs();
    api_get_Cells()
    api_get_UEs()
    api_get_paths()
});
// ===============================================





// Ajax request to get gNBs data
// on success: update the card at the top of the page
// and fill the datatable with values
// 
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
            ui_init_datatable_gNBs();
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



// Ajax request to get Cells data
// on success: update the card at the top of the page
// and fill the datatable with values
// 
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
            ui_init_datatable_Cells();
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


// Ajax request to get UEs data
// on success: update the card at the top of the page
// and fill the datatable with values
// 
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
            ui_init_datatable_UEs();
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



// Ajax request to get Paths data
// on success: update the card at the top of the page
// and fill the datatable with values
// 
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


// Helper function to update the numbers displayed on every card
// 
function ui_update_card( element_id, number ) {
    $( element_id ).html(number);
}



// ===============================================
//               Datatable functions
// ===============================================
function ui_init_datatable_gNBs() {
    $('#dt-gNBs').DataTable( {
        data: gNBs,
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        pageLength: -1,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
        columns: [
            { "data": "id", className: "dt-center" },
            { "data": "gNB_id", className: "dt-center" },
            { "data": "name", className: "dt-center" },
            { "data": "description" },
            { "data": "location", className: "dt-center" },
        ]
    } );
}
function ui_init_datatable_Cells() {
    $('#dt-cells').DataTable( {
        data: cells,
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        pageLength: -1,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
        columns: [
            { "data": "id", className: "dt-center" },
            { "data": "cell_id", className: "dt-center" },
            { "data": "name", className: "dt-center" },
            { "data": "description" },
            { "data": "gNB_id", className: "dt-center" },
        ]
    } );
}
function ui_init_datatable_UEs() {
    $('#dt-ues').DataTable( {
        data: ues,
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        pageLength: -1,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
        columns: [
            { "data": "supi", className: "dt-center" },
            { "data": "name", className: "dt-center" },
            { "data": "description" },
            { "data": "Cell_id", className: "dt-center" },
            { "data": "ip_address_v4", className: "dt-center" },
            { "data": "mac_address", className: "dt-center" },
            { "data": "speed", className: "dt-center" },
        ]
    } );
}
// ===============================================