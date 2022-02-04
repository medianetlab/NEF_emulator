// ===============================================
//               Global variables
// ===============================================

var gNBs  = null;
var db_ID_to_gNB_id  = {};
var gNBs_datatable  = null;


// templates for buttons added to datatbles rows (DELETE / EDIT)
// =============================================================
    // delete gNB
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


// gNB modals initialization and helper variables
// ==============================================
    var  del_gNB_modal = new coreui.Modal(document.getElementById( 'del_gNB_modal'), {});
    var edit_gNB_modal = new coreui.Modal(document.getElementById('edit_gNB_modal'), {});
    var  add_gNB_modal = new coreui.Modal(document.getElementById( 'add_gNB_modal'), {});
    var gNB_to_be_deleted = -1;
    var gNB_to_be_edited  = -1;
    var gNB_tmp_obj       = null;

// ===============================================
//             End of Global variables
// ===============================================









// ===============================================
//                 API functions
// ===============================================

// Ajax request to get gNBs data
// on success: update the card at the top of the page
// and fill the datatable with values
// 
function api_get_gNBs( callback ) {
    
    var url = app.api_url + '/gNBs?skip=0&limit=100';

    $.ajax({
        type: 'GET',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        processData:  false,
        beforeSend: function() {
            $('.card-gNBs       .spinner-grow'  ).show();
            $('.card-table-gNBs .spinner-border').show();
        },
        success: function(data)
        {
            console.log( data );
            callback( data );
        },
        error: function(err)
        {
            console.log(err);
        },
        complete: function()
        {
            $('.card-gNBs       .spinner-grow'  ).hide();
            $('.card-table-gNBs .spinner-border').hide();
        },
        timeout: 5000
    });
}

// Ajax request to delete gNB
// on success: remove it from datatables too
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
            ui_fetch_and_update_gNBs_data();
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
            ui_fetch_and_update_gNBs_data();
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

// Ajax request to create gNB
// on success: add it inside datatables too
// 
function api_post_gNB( gNB_obj ) {
    
    var url = app.api_url + '/gNBs';

    $.ajax({
        type: 'POST',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        data:         JSON.stringify(gNB_obj),
        processData:  false,
        beforeSend: function() {
            // 
        },
        success: function(data)
        {
            // console.log(data);
            ui_display_toast_msg("success", "Success!", "The gNB has been created");
            ui_fetch_and_update_gNBs_data();
        },
        error: function(err)
        {
            console.log(err);
            ui_display_toast_msg("error", "Error: gNB could not be created", err.responseJSON.detail[0].msg);
        },
        complete: function()
        {
            // 
        },
        timeout: 5000
    });
}

// ===============================================
//            End of API functions
// ===============================================









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


function ui_redraw_datatable_gNBs() {
  gNBs_datatable.clear().rows.add( gNBs ).draw();
}
// ===============================================
//           End of Datatable functions
// ===============================================










// ===============================================
//                  UI functions
// ===============================================


function ui_fetch_and_update_gNBs_data() {

  api_get_gNBs( function( gNBs_data_fetched ){
    gNBs = gNBs_data_fetched;
    ui_update_card( '#num-gnbs-card' , gNBs.length );

    // first time fetched: init datatable
    // else: redraw datatable
    if ( gNBs_datatable == null) {
      ui_init_datatable_gNBs();
    } else {
      ui_redraw_datatable_gNBs();
    }
    
    helper_create_db_id_to_gNB_id_bindings();
  });
}



// adds listeners for CUD operations regarding gNBs
//   C: CREATE (add)
//   U: UPDATE (edit)
//   D: DELETE
// The steps are more or less:
//  - show the relevant modal message
//  - call the relevant API call
//  - hide the modal message
// 
function ui_add_btn_listeners_for_gNBs_CUD_operations() {

    // CREATE
    $('#add_gNB_btn').on('click', function(){

        var data = {
          gNB_id      : $('#new_gNB_id').val(),
          name        : $('#new_gNB_name').val(),
          location    : $('#new_gNB_location').val(),
          description : $('#new_gNB_description').val(),  
        };

        api_post_gNB( data );
        add_gNB_modal.hide();
    });

    // UPDATE
    $('#update_gNB_btn').on('click', function(){

        // get possible changes from form
        gNB_tmp_obj.gNB_id      = $('#gNB_id').val();
        gNB_tmp_obj.name        = $('#gNB_name').val();
        gNB_tmp_obj.location    = $('#gNB_location').val();
        gNB_tmp_obj.description = $('#gNB_description').val();
        
        api_put_gNB( gNB_tmp_obj );
        edit_gNB_modal.hide();
    });

    // DELETE
    $('#del_gNB_btn').on('click', function(){
        api_delete_gNB( gNB_to_be_deleted );
        del_gNB_modal.hide();
    }); 
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


function ui_show_add_gNB_modal(  ) {

    add_gNB_modal.show();

}

// ===============================================
//               End of UI functions
// ===============================================










// ===============================================
//                Helper functions
// ===============================================


// iterates through the gNB list
// and returns a copy of the gNB object with the gNB_id provided
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


// iterates through the gNB list
// and updates (if found) the gNB object provided
//
function helper_update_gNB( gNB_obj ) {

    for (i=0 ; i<gNBs.length ; i++) {
        if ( gNBs[i].id == gNB_obj.id ) {
            gNBs[i] = JSON.parse(JSON.stringify( gNB_obj )); // found, updated
        }
    }
}


// iterates through the gNB list
// and removes (if found) the gNB_id provided
// 
function helper_delete_gNB( gNB_id ) {

    var i = gNBs.length;
    while (i--) {
        if ( gNBs[i].gNB_id == gNB_id ) {
            gNBs.splice(i, 1);
        }
    }
}


function helper_create_db_id_to_gNB_id_bindings() {

    // reset
    db_ID_to_gNB_id = {};

    // reload
    $.each(gNBs, function (i, item) {
        db_ID_to_gNB_id[ item.id.toString() ] = item.gNB_id;
    });
}

// ===============================================
//             End of Helper functions
// ===============================================

