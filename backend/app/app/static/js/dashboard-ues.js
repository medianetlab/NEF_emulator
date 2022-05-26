// ===============================================
//               Global variables
// ===============================================
var ues   = null;
var ues_datatable   = null;

// templates for buttons added to datatbles rows (DELETE / EDIT)
// =============================================================
    // delete UE
    var del_UE_btn_tpl = `<button class="btn btn-sm btn-outline-secondary" type="button" onclick="ui_show_delete_UE_modal( '{{supi}}' );">
      <svg class="icon">
        <use xlink:href="static/vendors/@coreui/icons/svg/free.svg#cil-trash"></use>
      </svg>
    </button>`;

    // edit UE
    var edit_UE_btn_tpl = `<button class="btn btn-sm btn-outline-dark" type="button" onclick="ui_show_edit_UE_modal( '{{supi}}' );">
      <svg class="icon">
        <use xlink:href="static/vendors/@coreui/icons/svg/free.svg#cil-pencil"></use>
      </svg>
    </button>`;




// UE modals initialization and helper variables
// ===============================================
    var  del_UE_modal    = new coreui.Modal(document.getElementById( 'del_UE_modal'), {});
    var edit_UE_modal    = new coreui.Modal(document.getElementById('edit_UE_modal'), {});
    var  add_UE_modal    = new coreui.Modal(document.getElementById( 'add_UE_modal'), {});
    var UE_to_be_deleted = -1;
    var UE_to_be_edited  = -1;
    var edit_UE_tmp_obj  = null;

    // leaflet.js map for editing UE modal
    var edit_UE_map          = null;
    var edit_UE_position_lg  = L.layerGroup(); // map layer group for UEs
    var edit_UE_cell_lg      = L.layerGroup(); // map layer group
    var edit_UE_coverage_lg  = L.layerGroup(); // map layer group
    var edit_UE_all_paths_lg = L.layerGroup(); // map layer group for paths
    var edit_UE_selected_path_lg = L.layerGroup(); // map layer group for selected path

    var edit_UE_circle_dot  = null;           // small circle depicting the position of the UE (to be edited)
    // leaflet.js map for adding UE modal
    var add_UE_map          = null;
    var add_UE_position_lg  = L.layerGroup(); // map layer group for UEs
    var add_UE_cell_lg      = L.layerGroup(); // map layer group
    var add_UE_coverage_lg  = L.layerGroup(); // map layer group
    var add_UE_all_paths_lg = L.layerGroup(); // map layer group for all paths
    var add_UE_selected_path_lg  = L.layerGroup(); // map layer group for selected path
    var add_UE_circle_dot   = null;           // small circle depicting the position of the UE (to be edited)

// ===============================================
//             End of Global variables
// ===============================================










// ===============================================
//                 API functions
// ===============================================

// Ajax request to get UEs data
// on success: update the card at the top of the page
// and fill the datatable with values
// 
function api_get_UEs( callback ) {
    
    var url = app.api_url + '/UEs?skip=0&limit=100';

    $.ajax({
        type: 'GET',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        processData:  false,
        beforeSend: function() {
            $('.card-ues       .spinner-grow-sm').show();
            $('.card-table-ues .spinner-border' ).show();
        },
        success: function(data)
        {
            console.log(data);
            callback( data )
        },
        error: function(err)
        {
            console.log(err);
        },
        complete: function()
        {
            $('.card-ues       .spinner-grow-sm').hide();
            $('.card-table-ues .spinner-border' ).hide();
        },
        timeout: 5000
    });
}

// Ajax request to delete UE
// on success: remove it from datatables too
// 
function api_delete_UE( UE_supi ) {
    
    var url = app.api_url + '/UEs/' + UE_supi;

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
            ui_display_toast_msg("success", "Success!", "The UE has been permanently deleted");
            ui_fetch_and_update_ues_data();
        },
        error: function(err)
        {
            // console.log(err);
            ui_display_toast_msg("error", "Error: UE could not be deleted", err.responseJSON.detail);
        },
        complete: function()
        {
            // 
        },
        timeout: 5000
    });
}

// Ajax request to update UE
// on success: update it inside datatables too
// and return to callback
// 
function api_put_UE_callback( UE_obj, callback ) {
    
    var url = app.api_url + '/UEs/' + UE_to_be_edited; // using UE_obj.UE_id would not work if the user has provided new UE_id value

    var UE_obj_copy =  JSON.parse(JSON.stringify( UE_obj )); // copy to be used with fewer object properties

    // remove not required properties
    delete UE_obj_copy.supi;
    delete UE_obj_copy.latitude;
    delete UE_obj_copy.longitude;
    delete UE_obj_copy.cell_id_hex;
    delete UE_obj_copy.id;
    delete UE_obj_copy.owner_id;
    delete UE_obj_copy.path_id;

    $.ajax({
        type: 'PUT',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        data:         JSON.stringify(UE_obj_copy),
        processData:  false,
        beforeSend: function() {
            // 
        },
        success: function(data)
        {
            // console.log(data);
            ui_display_toast_msg("success", "Success!", "The UE has been updated");
            callback(data);
        },
        error: function(err)
        {
            console.log(err);
            ui_display_toast_msg("error", "Error: UE could not be updated", err.responseJSON.detail);
        },
        complete: function()
        {
            // 
        },
        timeout: 5000
    });
}

// Ajax request to create UE
// on success: add it inside datatables too
// and return to callback
// 
function api_post_UE_callback( UE_obj, callback ) {

    // console.log(cell_obj);
    
    var url = app.api_url + '/UEs';

    delete UE_obj.path_id; //not needed after the assignment of paths changed. The path_id attribute is now used by api_post_assign_path

    $.ajax({
        type: 'POST',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        data:         JSON.stringify(UE_obj),
        processData:  false,
        beforeSend: function() {
            // 
        },
        success: function(data)
        {
            // console.log(data);
            ui_display_toast_msg("success", "Success!", "The UE has been created");
            
            // ues.push(data);
            // ues_datatable.clear().rows.add( ues ).draw();    // moved inside callback
            // ui_update_card( '#num-UEs-card' , ues.length );  // moved inside callback
            callback(data);
        },
        error: function(err)
        {
            console.log(err);
            ui_display_toast_msg("error", "Error: UE could not be created", JSON.stringify( err.responseJSON.detail) );
        },
        complete: function()
        {
            // 
        },
        timeout: 5000
    });
}

// 
// 
function api_get_state_loop_for( UE_supi ) {
    var url = app.api_url + '/utils/state-loop/' + UE_supi;

    $.ajax({
        type: 'GET',
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
            if ( data.running ) {
                ui_display_toast_msg("warning", "Oups! The current UE is moving.", "You cannot edit it without first stopping it.");
            }
        },
        error: function(err)
        {
            console.log(err);
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

function ui_init_datatable_UEs() {
    ues_datatable = $('#dt-ues').DataTable( {
        data: ues,
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        pageLength: -1,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
        columnDefs: [
            {
                "targets": 3, // cell id
                "data": null,
                "defaultContent": '',
                "orderable" : true,
                "searchable": true,
                "render": function ( data, type, row ) {
                    if (data == null) {return "-";}  // if null, display "-"
                    else {return data;}
                }
            },
            {
                "targets": 5,  // path id
                "data": null,
                "defaultContent": '',
                "orderable" : true,
                "searchable": true,
                "render": function ( data, type, row ) {
                    // return row.id;
                    if (data == 0) {return "-";}  // if null, display "-"
                    else {return data;}
                }
            },
            {
                "targets": 7,  // buttons
                "data": null,
                "defaultContent": '',
                "orderable" : false,
                "searchable": false,
                "render": function ( data, type, row ) {
                    // return row.id;
                    return  (  del_UE_btn_tpl.replaceAll("{{supi}}", row.supi) + " " +
                              edit_UE_btn_tpl.replaceAll("{{supi}}", row.supi) );
                }
            }
        ],
        columns: [
            { "data": "supi", className: "dt-center" },
            { "data": "name", className: "dt-center" },
            { "data": "external_identifier" },
            { "data": "cell_id_hex", className: "dt-center" },
            { "data": "ip_address_v4", className: "dt-center" },
            { "data": "path_id", className: "dt-center" },
            { "data": "speed", className: "dt-center" },
            { "data": null, className: "dt-right" },
        ]
    } );
}


function ui_redraw_datatable_UEs() {
  ues_datatable.clear().rows.add( ues ).draw();
}
// ===============================================
//           End of Datatable functions
// ===============================================





// ===============================================
//                  UI functions
// ===============================================


function ui_fetch_and_update_ues_data() {
  api_get_UEs( function( ues_data_fetched ){
    ues = ues_data_fetched;
    ui_update_card( '#num-UEs-card' , ues.length );
    
    // first time fetched: init datatable
    // else: redraw datatable
    if ( ues_datatable == null) {
      ui_init_datatable_UEs();
    } else {
      ui_redraw_datatable_UEs();
    }
  });
}



// adds listeners for CUD operations regarding UEs
//   C: CREATE (add)
//   U: UPDATE (edit)
//   D: DELETE
// The steps are more or less:
//  - show the relevant modal message
//  - call the relevant API call
//  - hide the modal message
// 
function ui_add_btn_listeners_for_UEs_CUD_operations() {

    // CREATE
    $('#add_UE_btn').on('click', function(){

        var assign_path_id = parseInt( $('#add_UE_path').val() );

        var data = {
          // general info
          supi                : $('#add_UE_supi').val(),
          name                : $('#add_UE_name').val(),
          external_identifier : $('#add_UE_ext_id').val(),
          description         : $('#add_UE_description').val(),
          // network
          ip_address_v4       : $('#add_UE_ipv4').val(),
          ip_address_v6       : $('#add_UE_ipv6').val(),
          mac_address         : $('#add_UE_mac').val(),
          mcc                 : $('#add_UE_mcc').val(),
          mnc                 : $('#add_UE_mnc').val(),
          dnn                 : $('#add_UE_dnn').val(),
          // location & path
          path_id             : assign_path_id,
          speed               : $('#add_UE_speed').val(),
          gNB_id              : 1,
          Cell_id             : 1,
        };


        add_UE_modal.hide();

        // api calls
        api_post_UE_callback( data, function(UE_obj){
            // on success, assign path
            api_post_assign_path( UE_obj.supi, assign_path_id );
        });
    });

    // DELETE
    $('#del_UE_btn').on('click', function(){
        api_delete_UE( UE_to_be_deleted );
        del_UE_modal.hide();
    });

    // UPDATE
    $('#update_UE_btn').on('click', function(){

        var assign_path_id = parseInt( $('#edit_UE_path').val() );
        
        // get possible changes from form
        // general info
        edit_UE_tmp_obj.name                = $('#edit_UE_name').val();
        edit_UE_tmp_obj.external_identifier = $('#edit_UE_ext_id').val();
        edit_UE_tmp_obj.description         = $('#edit_UE_description').val();

        // network
        edit_UE_tmp_obj.ip_address_v4 = $('#edit_UE_ipv4').val();
        edit_UE_tmp_obj.ip_address_v6 = $('#edit_UE_ipv6').val();
        edit_UE_tmp_obj.mac_address   = $('#edit_UE_mac').val();

        // location & path
        edit_UE_tmp_obj.path_id = assign_path_id;
        edit_UE_tmp_obj.speed   = $('#edit_UE_speed').val();

        
        edit_UE_modal.hide();

        // api calls
        api_put_UE_callback( edit_UE_tmp_obj, function(UE_obj){
            // // on success, assign path (if selected)
            // api_post_assign_path( UE_obj.supi, assign_path_id );
            ui_fetch_and_update_ues_data();
        });
    });
}


function ui_show_delete_UE_modal( UE_id ) {

    UE_to_be_deleted = UE_id;
    del_UE_modal.show();
}


// shows modal for editing UEs
// looks up for the specific UE and loads its details to the form fields
//   - the user is allowed to modify only some fields
// 
function ui_show_edit_UE_modal( UE_supi ) {

    edit_UE_position_lg.clearLayers(); // map UE   layer cleanup
    edit_UE_all_paths_lg.clearLayers();     // map path layer cleanup
    edit_UE_cell_lg.clearLayers();
    edit_UE_coverage_lg.clearLayers();
    edit_UE_selected_path_lg.clearLayers();

    UE_to_be_edited = UE_supi;

    edit_UE_tmp_obj = helper_find_UE( UE_supi );
    
    // load values to the input fields
    $('#db_UE_id').val( edit_UE_tmp_obj.id );
    $('#edit_UE_supi').val( edit_UE_tmp_obj.supi );
    $('#edit_UE_name').val( edit_UE_tmp_obj.name );
    $('#edit_UE_ext_id').val( edit_UE_tmp_obj.external_identifier );

    $('#edit_UE_description').val( edit_UE_tmp_obj.description );

    $('#edit_UE_ipv4').val( edit_UE_tmp_obj.ip_address_v4 );
    $('#edit_UE_ipv6').val( edit_UE_tmp_obj.ip_address_v6 );
    $('#edit_UE_mac').val( edit_UE_tmp_obj.mac_address );
    $('#edit_UE_gNB').val( db_ID_to_gNB_id[edit_UE_tmp_obj.gNB_id] );

    $('#edit_UE_dnn').val( edit_UE_tmp_obj.dnn );
    $('#edit_UE_mcc').val( edit_UE_tmp_obj.mcc );
    $('#edit_UE_mnc').val( edit_UE_tmp_obj.mnc );
    $('#edit_UE_cell').val( edit_UE_tmp_obj.cell_id_hex );

    $('#edit_UE_current_lat').val( edit_UE_tmp_obj.latitude );
    $('#edit_UE_current_lon').val( edit_UE_tmp_obj.longitude );
    $('#edit_UE_speed').val( edit_UE_tmp_obj.speed );
    

    // refresh the path options in the select input
    $('#edit_UE_path').empty(); // delete the old ones
    $('#edit_UE_path').append($('<option>', {"value":0, "text":"no path selected"})); // add option for "no path selected"
    $.each(paths, function (i, item) {

        var data = { 
            value: item.id,
            text : item.description
        };
        
        if (item.id === edit_UE_tmp_obj.path_id) {
            data["selected"] = true;
        }

        $('#edit_UE_path').append($('<option>', data));
    });
    

    edit_UE_modal.show();
    edit_UE_map.invalidateSize(); // this helps the map display its tiles correctly after the size of the modal is finalized

    // add a solid-color small circle (dot) at the current lat,lon
    if ((edit_UE_tmp_obj.latitude != null) && (edit_UE_tmp_obj.longitude != null)) {
        L.circle([edit_UE_tmp_obj.latitude,edit_UE_tmp_obj.longitude], 3, {
            color: 'none',
            fillColor: '#3590e2',
            fillOpacity: 1.0
        }).addTo(edit_UE_position_lg).addTo( edit_UE_map );
    }
    

    // paint the current path of the UE (if not zero)
    if (edit_UE_tmp_obj.path_id != 0) {
        api_get_specific_path_callback( edit_UE_tmp_obj.path_id, function(data){
            // console.log(data);
            ui_map_paint_path(data, edit_UE_map, edit_UE_selected_path_lg, 0.75);
        });
    }
    
    
    // edit_UE_map.setView(
    //     {
    //         lat: edit_UE_tmp_obj.latitude,
    //         lon: edit_UE_tmp_obj.longitude
    //     },
    //     18 // zoom level
    // );

    ui_draw_Cells_to_map(edit_UE_map, edit_UE_cell_lg, edit_UE_coverage_lg, "#f03");
    ui_map_fit_bounds_to_cells( edit_UE_map );
    ui_draw_UEs_to_map( edit_UE_map, edit_UE_position_lg );
    ui_draw_paths_to_map( edit_UE_map, edit_UE_all_paths_lg, 0.2 );
}


function ui_show_add_UE_modal(  ) {

    if ( (cells.length == 0) || (gNBs.length == 0) ) {
        ui_display_toast_msg("warning", "Oups! Add a gNB & a Cell first.", "You cannot add new UEs without first having at least one gNB and one cell.");
        return;
    }

    if (paths.length == 0) {
        ui_display_toast_msg("warning", "Oups! Add a path first.", "You cannot add new UEs without first having at least one path.");
        return;
    }

    add_UE_position_lg.clearLayers(); // map layer cleanup
    add_UE_cell_lg.clearLayers();
    add_UE_coverage_lg.clearLayers();
    add_UE_all_paths_lg.clearLayers();


    // refresh the path options in the select input
    $('#add_UE_path').empty(); // delete the old ones
    // $('#add_UE_path').append($('<option>', { value: -1, text: "none" })); // add a prompt
    $.each(paths, function (i, item) {

        var data = { 
            value: item.id,
            text : item.description
        };

        $('#add_UE_path').append($('<option>', data));
    });
    $('#add_UE_path').trigger("change");

    add_UE_modal.show();

    add_UE_map.invalidateSize(); // this helps the map display its tiles correctly after the size of the modal is finalized

    ui_draw_Cells_to_map(add_UE_map, add_UE_cell_lg, add_UE_coverage_lg, "#f03");
    ui_map_fit_bounds_to_cells( add_UE_map );
    ui_draw_UEs_to_map( add_UE_map, add_UE_position_lg );
    ui_draw_paths_to_map( add_UE_map, add_UE_all_paths_lg, 0.2 );
}



function ui_initialize_edit_UE_map() {

    // set map height
    $('#edit_UE_mapid').css({ "height": 600 } );

    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9',    tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23}),
        streets     = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23});


    // map initialization
    edit_UE_map = L.map('edit_UE_mapid', {
        layers: [grayscale, edit_UE_position_lg, edit_UE_cell_lg, edit_UE_coverage_lg, edit_UE_all_paths_lg, edit_UE_selected_path_lg]
    }).setView([48.499998, 23.383331], 5);    // Geographical midpoint of Europe


    var baseLayers = {
            "Grayscale": grayscale,
            "Streets": streets
        };

    var overlays = {
        "UEs"      : edit_UE_position_lg,
        "Cells"    : edit_UE_cell_lg,
        "Coverage" : edit_UE_coverage_lg,
        "Paths"     : edit_UE_all_paths_lg,
        "selected path" : edit_UE_selected_path_lg
    };

    L.control.layers(baseLayers, overlays).addTo(edit_UE_map);

}



function ui_initialize_add_UE_map() {

    // set map height
    $('#add_UE_mapid').css({ "height": 600 } );

    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9',    tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23}),
        streets     = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23});


    // map initialization
    add_UE_map = L.map('add_UE_mapid', {
        layers: [grayscale, add_UE_position_lg, add_UE_cell_lg, add_UE_coverage_lg, add_UE_all_paths_lg, add_UE_selected_path_lg]
    }).setView([48.499998, 23.383331], 5);    // Geographical midpoint of Europe


    var baseLayers = {
            "Grayscale": grayscale,
            "Streets": streets
        };

    var overlays = {
        "UEs"      : add_UE_position_lg,
        "Cells"    : add_UE_cell_lg,
        "Coverage" : add_UE_coverage_lg,
        "Paths"    : add_UE_all_paths_lg,
        "Selected path" : add_UE_selected_path_lg
    };

    L.control.layers(baseLayers, overlays).addTo(add_UE_map);

    
}



function ui_edit_UE_modal_add_listeners() {

    $('#edit_UE_path').on('change', function(){
        selected_path_id = $(this).val();

        if (selected_path_id != 0) {
            // add path to map
            api_get_specific_path_callback( selected_path_id, function(data){
                edit_UE_selected_path_lg .clearLayers();
                ui_map_paint_path(data, edit_UE_map, edit_UE_selected_path_lg, 0.75);
            });

            api_post_assign_path( edit_UE_tmp_obj.supi, selected_path_id );
        }
        else {
            edit_UE_selected_path_lg.clearLayers();
        }
    });
}



function ui_add_UE_modal_add_listeners() {

    $('#add_UE_path').on('change', function(){
        selected_path_id = $(this).val();

        // add path to map
        api_get_specific_path_callback( selected_path_id, function(data){
            add_UE_selected_path_lg.clearLayers();
            ui_map_paint_path(data, add_UE_map, add_UE_selected_path_lg, 0.75);
        });
    });
}





// ===============================================
//                Helper functions
// ===============================================


// iterates through the UE list
// and returns a copy of the UE object with the UE_id provided
// (if not found it returns null)
// 
function helper_find_UE( UE_supi ) {
    for (const item of ues) {
        if ( item.supi == UE_supi ) {
            return JSON.parse(JSON.stringify( item )); // return a copy of the item
        }
    }
    return null;
}


// ===============================================
//             End of Helper functions
// ===============================================