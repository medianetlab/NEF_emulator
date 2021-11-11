// ===============================================
//               Global variables
// ===============================================
var gNBs  = null;
var cells = null;
var ues   = null;
var paths = null;

var gNBs_datatable = null;



// templates for buttons
// =====================
// delete_gNB
var del_gNB_btn_tpl = `<button class="btn btn-sm btn-outline-secondary" type="button" onclick="ui_show_delete_gNB_modal( '{{gNB_id}}' );">
  <svg class="icon">
    <use xlink:href="static/vendors/@coreui/icons/svg/free.svg#cil-trash"></use>
  </svg>
</button>`;

// edit gNB
var edit_gNB_btn_tpl = `<button class="btn btn-sm btn-outline-dark" type="button" onclick="ui_show_edit_gNB_modal( '{{gNB_id}}' );">
  <svg class="icon">
    <use xlink:href="static/vendors/@coreui/icons/svg/free.svg#cil-pencil"></use>
  </svg>
</button>`;

// modal for delete_gNB confirmation
var  del_gNB_modal = new coreui.Modal(document.getElementById('del_gNB_modal'),  {});
var edit_gNB_modal = new coreui.Modal(document.getElementById('edit_gNB_modal'), {});
var gNB_to_be_deleted = -1;
var gNB_to_be_edited  = -1;
var gNB_tmp_obj       = null;








// ===============================================
//                 Document ready
// ===============================================
$( document ).ready(function() {
    api_get_gNBs();
    api_get_Cells()
    api_get_UEs()
    api_get_paths()


    // add listener to buttons
    $('#del_gNB_btn').on('click', function(){
        // console.log(gNB_to_be_deleted);
        api_delete_gNB( gNB_to_be_deleted );
        del_gNB_modal.hide();
    });
    
    $('#update_gNB_btn').on('click', function(){

        // get possible changes from form
        gNB_tmp_obj.gNB_id      = $('#gNB_id').val();
        gNB_tmp_obj.name        = $('#gNB_name').val();
        gNB_tmp_obj.location    = $('#gNB_location').val();
        gNB_tmp_obj.description = $('#gNB_description').val();
        
        api_put_gNB( gNB_tmp_obj );
        edit_gNB_modal.hide();
    });



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


// Ajax request to delete gNB
// on success: remove it from datatables
// by using its functions API
// 
function api_delete_gNB( gNB_id ) {
    
    var url = app.api_url + '/gNBs/' + gNB_id;

    $.ajax({
        type: 'DELETE',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        processData:  false,
        beforeSend: function() {
            // 
        },
        success: function(data)
        {
            // console.log(data);
            ui_display_toast_msg("success", "Success!", "The gNB has been permanently deleted");
            
            // find index and remove from datatable
            var indexes = gNBs_datatable
                .rows()
                .indexes()
                .filter( function ( value, index ) {
                    return gNB_id === gNBs_datatable.row(value).data().gNB_id;
                } );

            gNBs_datatable.rows(indexes).remove().draw();
        },
        error: function(err)
        {
            // console.log(err);
            ui_display_toast_msg("error", "Error: gNB could not be deleted", err.responseJSON.detail);
        },
        complete: function()
        {
            // 
        },
        timeout: 5000
    });
}

// Ajax request to update gNB
// on success: update it inside datatables too
// by using its functions API
// 
function api_put_gNB( gNB_obj ) {
    
    var url = app.api_url + '/gNBs/' + gNB_to_be_edited; // using gNB_obj.gNB_id would not work if the user has provided new gNB_id value

    var gNB_obj_copy =  JSON.parse(JSON.stringify( gNB_obj )); // copy to be used with fewer object fields

    // remove not required fields
    delete gNB_obj_copy.id;
    delete gNB_obj_copy.owner_id;

    $.ajax({
        type: 'PUT',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        data:         JSON.stringify(gNB_obj_copy),
        processData:  false,
        beforeSend: function() {
            // 
        },
        success: function(data)
        {
            // console.log(data);
            ui_display_toast_msg("success", "Success!", "The gNB has been updated");
            
            helper_update_gNB( gNB_obj );
            
            gNBs_datatable.clear().rows.add( gNBs ).draw();
        },
        error: function(err)
        {
            console.log(err);
            ui_display_toast_msg("error", "Error: gNB could not be updated", err.responseJSON.detail[0].msg);
        },
        complete: function()
        {
            // 
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
    gNBs_datatable = $('#dt-gNBs').DataTable( {
        data: gNBs,
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        pageLength: -1,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
        columnDefs: [
            {
                "targets": 5,
                "data": null,
                "defaultContent": '',
                "orderable" : false,
                "searchable": false,
                "render": function ( data, type, row ) {
                    // return row.id;
                    return  (  del_gNB_btn_tpl.replaceAll("{{gNB_id}}", row.gNB_id) + " " +
                              edit_gNB_btn_tpl.replaceAll("{{gNB_id}}", row.gNB_id) );
                }
            }
        ],
        columns: [
            { "data": "id", className: "dt-center" },
            { "data": "gNB_id", className: "dt-center" },
            { "data": "name", className: "dt-center" },
            { "data": "description" },
            { "data": "location", className: "dt-center" },
            { "data": null, className: "dt-right" },
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



function ui_display_toast_msg( type, title, text ) {
    toastr_options = {
        closeButton     : true,
        positionClass   : "toast-bottom-right",
        // timeOut         : 0,
        // extendedTimeOut : 0
    };
    toastr[type](text, title, toastr_options);
}




function ui_show_delete_gNB_modal( gNB_id ) {

    gNB_to_be_deleted = gNB_id;
    del_gNB_modal.show();

}


// shows modal for editing gNBs
// looks up for the specific gNB and loads its details to the form fields
// 
function ui_show_edit_gNB_modal( gNB_id ) {

    gNB_to_be_edited = gNB_id;

    gNB_tmp_obj = helper_find_gNB( gNB_id );
    
    $('#db_gNB_id').val( gNB_tmp_obj.id );
    $('#gNB_id').val( gNB_tmp_obj.gNB_id );
    $('#gNB_name').val( gNB_tmp_obj.name );
    $('#gNB_location').val( gNB_tmp_obj.location );
    $('#gNB_description').val( gNB_tmp_obj.description );

    edit_gNB_modal.show();

}
// ===============================================



// iterates through the gNB lists
// and returns the gNB object with the gNB_id provided
// (if not found it returns null)
// 
function helper_find_gNB( gNB_id ) {
    for (const item of gNBs) {
        if ( item.gNB_id == gNB_id ) {
            return JSON.parse(JSON.stringify( item )); // return a copy of the item
        }
    }
    return null;
}



function helper_update_gNB( gNB_obj ) {

    console.log( gNB_obj );

    for (i=0 ; i<gNBs.length ; i++) {
        if ( gNBs[i].id == gNB_obj.id ) {
            gNBs[i] = gNB_obj; // found, updated
        }
    }
}