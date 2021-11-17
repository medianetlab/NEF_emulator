// ===============================================
//               Global variables
// ===============================================
var gNBs  = null;
var cells = null;
var ues   = null;
var paths = null;

var db_ID_to_gNB_id = {};

var gNBs_datatable  = null;
var cells_datatable = null;


// leaflet.js map for editing Cell modal
var edit_cell_map        = null;
var cell_coverage_lg     = L.layerGroup(); // map layer group
var edit_cell_circle_dot = null;           // small circle depicting the position of the cell (to be edited)
var edit_cell_circle_cov = null;           // large transparent circle depicting the coverage of the above cell




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

// delete cell
var del_cell_btn_tpl = `<button class="btn btn-sm btn-outline-secondary" type="button" onclick="ui_show_delete_cell_modal( '{{cell_id}}' );">
  <svg class="icon">
    <use xlink:href="static/vendors/@coreui/icons/svg/free.svg#cil-trash"></use>
  </svg>
</button>`;

// edit cell
var edit_cell_btn_tpl = `<button class="btn btn-sm btn-outline-dark" type="button" onclick="ui_show_edit_cell_modal( '{{cell_id}}' );">
  <svg class="icon">
    <use xlink:href="static/vendors/@coreui/icons/svg/free.svg#cil-pencil"></use>
  </svg>
</button>`;




// modal for delete_gNB confirmation
var  del_gNB_modal = new coreui.Modal(document.getElementById('del_gNB_modal'),  {});
var edit_gNB_modal = new coreui.Modal(document.getElementById('edit_gNB_modal'), {});
var add_gNB_modal  = new coreui.Modal(document.getElementById('add_gNB_modal'),  {});
var gNB_to_be_deleted = -1;
var gNB_to_be_edited  = -1;
var gNB_tmp_obj       = null;


var  del_cell_modal = new coreui.Modal(document.getElementById('del_cell_modal'),  {});
var edit_cell_modal = new coreui.Modal(document.getElementById('edit_cell_modal'), {});
// var add_cell_modal  = new coreui.Modal(document.getElementById('add_cell_modal'),  {});
var cell_to_be_deleted = -1;
var cell_to_be_edited  = -1;
var cell_tmp_obj       = null;








// ===============================================
//                 Document ready
// ===============================================
$( document ).ready(function() {
    api_get_gNBs();
    api_get_Cells()
    api_get_UEs()
    api_get_paths()


    // add listeners to buttons for CUD operations
    //   C: CREATE (add new items)
    //   U: UPDATE (edit existing items)
    //   D: DELETE (remove items)
    // 
    ui_add_btn_listeners_for_gNB_CUD_operations();
    ui_add_btn_listeners_for_cells_CUD_operations();


    // initialize the map used inside the edit cell modal
    // and add listeners to capture user changes (map & radius)
    ui_initialize_edit_cell_map();
    ui_edit_cell_modal_add_listeners();



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
            helper_create_db_id_to_gNB_id_bindings();
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
            
            helper_delete_gNB( gNB_id );
            helper_create_db_id_to_gNB_id_bindings();
            gNBs_datatable.clear().rows.add( gNBs ).draw();
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


// Ajax request to delete gNB
// on success: remove it from datatables too
// 
function api_delete_cell( cell_id ) {
    
    var url = app.api_url + '/Cells/' + cell_id;

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
            ui_display_toast_msg("success", "Success!", "The Cell has been permanently deleted");
            
            helper_delete_cell( cell_id );
            cells_datatable.clear().rows.add( cells ).draw();
        },
        error: function(err)
        {
            // console.log(err);
            ui_display_toast_msg("error", "Error: Cell could not be deleted", err.responseJSON.detail);
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
            
            helper_update_gNB( gNB_obj );
            helper_create_db_id_to_gNB_id_bindings();
            
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



// Ajax request to update gNB
// on success: update it inside datatables too
// 
function api_put_cell( cell_obj ) {
    
    var url = app.api_url + '/Cells/' + cell_to_be_edited; // using cell_obj.cell_id would not work if the user has provided new cell_id value

    var cell_obj_copy =  JSON.parse(JSON.stringify( cell_obj )); // copy to be used with fewer object properties

    // remove not required properties
    delete cell_obj_copy.id;
    delete cell_obj_copy.owner_id;

    $.ajax({
        type: 'PUT',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        data:         JSON.stringify(cell_obj_copy),
        processData:  false,
        beforeSend: function() {
            // 
        },
        success: function(data)
        {
            // console.log(data);
            ui_display_toast_msg("success", "Success!", "The Cell has been updated");
            
            helper_update_cell( cell_obj );
            
            cells_datatable.clear().rows.add( cells ).draw();
        },
        error: function(err)
        {
            console.log(err);
            ui_display_toast_msg("error", "Error: Cell could not be updated", err.responseJSON.detail[0].msg);
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
    
    var url = app.api_url + '/gNBs/';

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
            
            gNBs.push(data);
            helper_create_db_id_to_gNB_id_bindings();
            gNBs_datatable.clear().rows.add( gNBs ).draw();
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
    cells_datatable = $('#dt-cells').DataTable( {
        data: cells,
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        pageLength: -1,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
        columnDefs: [
            {
                "targets": 4,
                "data": null,
                "defaultContent": '',
                "orderable" : true,
                "searchable": false,
                "render": function ( data, type, row ) {
                    return  ( db_ID_to_gNB_id[data.gNB_id] );
                }
            },
            {
                "targets": 5,
                "data": null,
                "defaultContent": '',
                "orderable" : false,
                "searchable": false,
                "render": function ( data, type, row ) {
                    // return row.id;
                    return  (  del_cell_btn_tpl.replaceAll("{{cell_id}}", row.cell_id) + " " +
                              edit_cell_btn_tpl.replaceAll("{{cell_id}}", row.cell_id) );
                }
            }
        ],
        columns: [
            { "data": "id", className: "dt-center" },
            { "data": "cell_id", className: "dt-center" },
            { "data": "name", className: "dt-center" },
            { "data": "description" },
            { "data": null, className: "dt-center" },
            { "data": null, className: "dt-right" },
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


function ui_show_add_gNB_modal(  ) {

    add_gNB_modal.show();

}


function ui_show_delete_cell_modal( cell_id ) {

    cell_to_be_deleted = cell_id;
    del_cell_modal.show();

}

// shows modal for editing cells
// looks up for the specific cell and loads its details to the form fields
//   - the user is allowed to modify some fields
//   - the user can modify the latitude / longitude of the cell by clicking on the map
//   - the user can modify the radius of the cell
// 
function ui_show_edit_cell_modal( cell_id ) {

    cell_coverage_lg.clearLayers(); // map layer cleanup

    cell_to_be_edited = cell_id;

    cell_tmp_obj = helper_find_cell( cell_id );

    // prepare new location values
    cell_tmp_obj["new_latitude"]  = cell_tmp_obj.latitude;
    cell_tmp_obj["new_longitude"] = cell_tmp_obj.longitude + 0.001; // shift it a little bit right
    cell_tmp_obj["new_radius"]    = cell_tmp_obj.radius;
    
    // load values to the input fields
    $('#db_cell_id').val( cell_tmp_obj.id );
    $('#cell_id').val( cell_tmp_obj.cell_id );
    $('#cell_name').val( cell_tmp_obj.name );
    $('#cell_location').val( cell_tmp_obj.location );
    $('#cell_description').val( cell_tmp_obj.description );
    $('#cell_current_lat').val( cell_tmp_obj.latitude );
    $('#cell_current_lon').val( cell_tmp_obj.longitude );
    $('#cell_current_rad').val( cell_tmp_obj.radius );
    $('#cell_new_lat').val( cell_tmp_obj.new_latitude );
    $('#cell_new_lon').val( cell_tmp_obj.new_longitude );
    $('#cell_new_rad').val( cell_tmp_obj.new_radius );

    // refresh the gNB options in the select input
    $('#cell_gNB').empty(); // delete the old ones
    $.each(gNBs, function (i, item) {

        var data = { 
            value: item.id,
            text : item.gNB_id
        };
        
        if (item.id === cell_tmp_obj.gNB_id) {
            data["selected"] = true;
        }

        $('#cell_gNB').append($('<option>', data));
    });
    

    edit_cell_modal.show();
    edit_cell_map.invalidateSize(); // this helps the map display its tiles correctly after the size of the modal is finalized

    // add a solid-color small circle (dot) at the current lat,lon
    L.circle([cell_tmp_obj.latitude,cell_tmp_obj.longitude], 2, {
        color: 'none',
        fillColor: '#000',
        fillOpacity: 1.0
    }).addTo(cell_coverage_lg).addTo( edit_cell_map );

    // and a transparent circle for coverage 
    L.circle([cell_tmp_obj.latitude,cell_tmp_obj.longitude], cell_tmp_obj.radius, {
        color: 'none',
        fillColor: '#000',
        fillOpacity: 0.1
    }).addTo(cell_coverage_lg).addTo( edit_cell_map );
    
    edit_cell_map.setView(
        {
            lat: cell_tmp_obj.latitude,
            lon: cell_tmp_obj.longitude
        },
        17 // zoom level
    );

    // add a solid-color small circle (dot) some meters away
    edit_cell_circle_dot = L.circle([cell_tmp_obj.latitude,(cell_tmp_obj.longitude + 0.001)], 2, {
        color: 'none',
        fillColor: '#2686de',
        fillOpacity: 1.0
    }).addTo(cell_coverage_lg).addTo( edit_cell_map );

    // add a transparent circle for coverage 
    edit_cell_circle_cov = L.circle([cell_tmp_obj.latitude,(cell_tmp_obj.longitude + 0.001)], cell_tmp_obj.radius, {
        color: 'none',
        fillColor: '#2686de',
        fillOpacity: 0.2
    }).addTo(cell_coverage_lg).addTo( edit_cell_map );
}
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



// iterates through the cells list
// and removes (if found) the cell_id provided
// 
function helper_delete_cell( cell_id ) {

    var i = cells.length;
    while (i--) {
        if ( cells[i].cell_id == cell_id ) {
            cells.splice(i, 1);
        }
    }
}

// iterates through the cells list
// and returns a copy of the cell object with the cell_id provided
// (if not found it returns null)
// 
function helper_find_cell( cell_id ) {
    for (const item of cells) {
        if ( item.cell_id == cell_id ) {
            return JSON.parse(JSON.stringify( item )); // return a copy of the item
        }
    }
    return null;
}

// iterates through the cell list
// and updates (if found) the cell oject provided
//
function helper_update_cell( cell_obj ) {

    for (i=0 ; i<cells.length ; i++) {
        if ( cells[i].id == cell_obj.id ) {
            cells[i] = JSON.parse(JSON.stringify( cell_obj )); // found, updated
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



// adds listeners for CUD operations regarding gNBs
//   C: CREATE (add)
//   U: UPDATE (edit)
//   D: DELETE
// The steps are more or less:
//  - show the relevant modal message
//  - call the relevant API call
//  - hide the modal message
// 
function ui_add_btn_listeners_for_gNB_CUD_operations() {

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



function ui_add_btn_listeners_for_cells_CUD_operations() {
    // DELETE
    $('#del_cell_btn').on('click', function(){
        api_delete_cell( cell_to_be_deleted );
        del_cell_modal.hide();
    });

    // UPDATE
    $('#update_cell_btn').on('click', function(){
        
        // get possible changes from form
        cell_tmp_obj.cell_id     = $('#cell_id').val();
        cell_tmp_obj.name        = $('#cell_name').val();
        cell_tmp_obj.description = $('#cell_description').val();
        cell_tmp_obj.gNB_id      = parseInt( $('#cell_gNB').val() );

        // override old values
        cell_tmp_obj.latitude    = parseFloat( cell_tmp_obj.new_latitude );
        cell_tmp_obj.longitude   = parseFloat( cell_tmp_obj.new_longitude );
        cell_tmp_obj.radius      =   parseInt( cell_tmp_obj.new_radius );

        // remove obsolete properties
        delete cell_tmp_obj.new_latitude;
        delete cell_tmp_obj.new_longitude;
        delete cell_tmp_obj.new_radius;
        
        api_put_cell( cell_tmp_obj );
        edit_cell_modal.hide();
    });
    
}



function ui_initialize_edit_cell_map() {

    // set map height
    $('#cell_mapid').css({ "height": 300 } );

    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9',    tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23}),
        streets     = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23});


    // map initialization
    edit_cell_map = L.map('cell_mapid', {
        layers: [grayscale, cell_coverage_lg]
    }).setView([48.499998, 23.383331], 5);    // Geographical midpoint of Europe


    var baseLayers = {
            "Grayscale": grayscale,
            "Streets": streets
        };

    var overlays = {
        "cell coverage": cell_coverage_lg,
    };

    L.control.layers(baseLayers, overlays).addTo(edit_cell_map);

    
}


function ui_edit_cell_modal_add_listeners() {

    $('#cell_new_rad').on('change', function(){
        cell_tmp_obj.new_radius = $('#cell_new_rad').val();
        edit_cell_circle_cov.setRadius(cell_tmp_obj.new_radius);
    });

    function onMapClick(e) {
        // console.log(e);
        edit_cell_circle_dot.setLatLng(e.latlng);
        edit_cell_circle_cov.setLatLng(e.latlng);
        edit_cell_circle_cov.setRadius(cell_tmp_obj.new_radius);

        cell_tmp_obj.new_latitude  = parseFloat( e.latlng.lat.toFixed(6) );
        cell_tmp_obj.new_longitude = parseFloat( e.latlng.lng.toFixed(6) );

        $('#cell_new_lat').val( cell_tmp_obj.new_latitude );
        $('#cell_new_lon').val( cell_tmp_obj.new_longitude );
    }

    edit_cell_map.on('click', onMapClick);
}