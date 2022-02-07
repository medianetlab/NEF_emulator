// ===============================================
//               Global variables
// ===============================================
var cells = null;
var cells_datatable = null;

// templates for buttons added to datatbles rows (DELETE / EDIT)
// =============================================================
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

// Cell modals initialization and helper variables
// ===============================================
    var  del_cell_modal = new coreui.Modal(document.getElementById('del_cell_modal'),  {});
    var edit_cell_modal = new coreui.Modal(document.getElementById('edit_cell_modal'), {});
    var  add_cell_modal = new coreui.Modal(document.getElementById('add_cell_modal'),  {});
    var cell_to_be_deleted = -1;
    var cell_to_be_edited  = -1;
    var edit_cell_tmp_obj  = null;

    // leaflet.js map for editing Cell modal
    var edit_cell_map         = null;
    var edit_cell_coverage_lg = L.layerGroup(); // map layer group
    var edit_cell_circle_dot  = null;           // small circle depicting the position of the cell (to be edited)
    var edit_cell_circle_cov  = null;           // large transparent circle depicting the coverage of the above cell
    // leaflet.js map for adding Cell modal
    var add_cell_map         = null;
    var add_cell_coverage_lg = L.layerGroup(); // map layer group
    var add_cell_circle_dot  = null;           // small circle depicting the position of the cell (to be added)
    var add_cell_circle_cov  = null;           // large transparent circle depicting the coverage of the above cell

// ===============================================
//             End of Global variables
// ===============================================
















// ===============================================
//                 API functions
// ===============================================

// Ajax request to get Cells data
// on success: update the card at the top of the page
// and fill the datatable with values
// 
function api_get_Cells( callback ) {
    
    var url = app.api_url + '/Cells?skip=0&limit=100';

    $.ajax({
        type: 'GET',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        processData:  false,
        beforeSend: function() {
            $('.card-cells       .spinner-grow-sm').show();
            $('.card-table-cells .spinner-border' ).show();
        },
        success: function(data)
        {
            console.log(data);
            callback( data );
        },
        error: function(err)
        {
            console.log(err);
        },
        complete: function()
        {
            $('.card-cells       .spinner-grow-sm').hide();
            $('.card-table-cells .spinner-border' ).hide();
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
            ui_fetch_and_update_cells_data();
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
            ui_fetch_and_update_cells_data();
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

// Ajax request to create Cell
// on success: add it inside datatables too
// 
function api_post_cell( cell_obj ) {

    // console.log(cell_obj);
    
    var url = app.api_url + '/Cells';

    $.ajax({
        type: 'POST',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        data:         JSON.stringify(cell_obj),
        processData:  false,
        beforeSend: function() {
            // 
        },
        success: function(data)
        {
            // console.log(data);
            ui_display_toast_msg("success", "Success!", "The Cell has been created");
            ui_fetch_and_update_cells_data();
        },
        error: function(err)
        {
            console.log(err);
            ui_display_toast_msg("error", "Error: cell could not be created", JSON.stringify( err.responseJSON.detail) );
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


function ui_redraw_datatable_Cells() {
  cells_datatable.clear().rows.add( cells ).draw();
}
// ===============================================
//           End of Datatable functions
// ===============================================












// ===============================================
//                  UI functions
// ===============================================


function ui_fetch_and_update_cells_data() {

  api_get_Cells( function( cells_data_fetched ){
    cells = cells_data_fetched;
    ui_update_card( '#num-cells-card' , cells.length );
    
    // first time fetched: init datatable
    // else: redraw datatable
    if ( cells_datatable == null) {
      ui_init_datatable_Cells();
    } else {
      ui_redraw_datatable_Cells();
    }
  });
}



// adds listeners for CUD operations regarding Cells
//   C: CREATE (add)
//   U: UPDATE (edit)
//   D: DELETE
// The steps are more or less:
//  - show the relevant modal message
//  - call the relevant API call
//  - hide the modal message
// 
function ui_add_btn_listeners_for_cells_CUD_operations() {

    // CREATE
    $('#add_cell_btn').on('click', function(){

        var data = {
          cell_id     : $('#add_cell_id').val(),
          name        : $('#add_cell_name').val(),
          gNB_id      : parseInt ( $('#add_cell_gNB').val() ),
          description : $('#add_cell_description').val(),
          latitude    : parseFloat( $('#add_cell_new_lat').val() ),
          longitude   : parseFloat( $('#add_cell_new_lon').val() ),
          radius      :   parseInt( $('#add_cell_new_rad').val() ),
        };

        api_post_cell( data );
        add_cell_modal.hide();
    });

    // DELETE
    $('#del_cell_btn').on('click', function(){
        api_delete_cell( cell_to_be_deleted );
        del_cell_modal.hide();
    });

    // UPDATE
    $('#update_cell_btn').on('click', function(){
        
        // get possible changes from form
        edit_cell_tmp_obj.cell_id      = $('#edit_cell_id').val();
        edit_cell_tmp_obj.name         = $('#edit_cell_name').val();
        edit_cell_tmp_obj.description  = $('#edit_cell_description').val();
        edit_cell_tmp_obj.gNB_id       = parseInt( $('#edit_cell_gNB').val() );

        // override old values
        edit_cell_tmp_obj.latitude    = parseFloat( edit_cell_tmp_obj.new_latitude );
        edit_cell_tmp_obj.longitude   = parseFloat( edit_cell_tmp_obj.new_longitude );
        edit_cell_tmp_obj.radius      =   parseInt( edit_cell_tmp_obj.new_radius );

        // remove obsolete properties
        delete edit_cell_tmp_obj.new_latitude;
        delete edit_cell_tmp_obj.new_longitude;
        delete edit_cell_tmp_obj.new_radius;
        
        api_put_cell( edit_cell_tmp_obj );
        edit_cell_modal.hide();
    });
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

    edit_cell_coverage_lg.clearLayers(); // map layer cleanup

    cell_to_be_edited = cell_id;

    edit_cell_tmp_obj = helper_find_cell( cell_id );

    // prepare new location values
    edit_cell_tmp_obj["new_latitude"]  = edit_cell_tmp_obj.latitude;
    edit_cell_tmp_obj["new_longitude"] = edit_cell_tmp_obj.longitude; // use  + 0.001 to shift it a little bit right
    edit_cell_tmp_obj["new_radius"]    = edit_cell_tmp_obj.radius;
    
    // load values to the input fields
    $('#db_cell_id').val( edit_cell_tmp_obj.id );
    $('#edit_cell_id').val( edit_cell_tmp_obj.cell_id );
    $('#edit_cell_name').val( edit_cell_tmp_obj.name );
    $('#edit_cell_location').val( edit_cell_tmp_obj.location );
    $('#edit_cell_description').val( edit_cell_tmp_obj.description );
    $('#edit_cell_current_lat').val( edit_cell_tmp_obj.latitude );
    $('#edit_cell_current_lon').val( edit_cell_tmp_obj.longitude );
    $('#edit_cell_current_rad').val( edit_cell_tmp_obj.radius );
    $('#edit_cell_new_lat').val( edit_cell_tmp_obj.new_latitude );
    $('#edit_cell_new_lon').val( edit_cell_tmp_obj.new_longitude );
    $('#edit_cell_new_rad').val( edit_cell_tmp_obj.new_radius );

    // refresh the gNB options in the select input
    $('#edit_cell_gNB').empty(); // delete the old ones
    $.each(gNBs, function (i, item) {

        var data = { 
            value: item.id,
            text : item.gNB_id
        };
        
        if (item.id === edit_cell_tmp_obj.gNB_id) {
            data["selected"] = true;
        }

        $('#edit_cell_gNB').append($('<option>', data));
    });
    

    edit_cell_modal.show();
    edit_cell_map.invalidateSize(); // this helps the map display its tiles correctly after the size of the modal is finalized

    // add a solid-color small circle (dot) at the current lat,lon
    L.circle([edit_cell_tmp_obj.latitude,edit_cell_tmp_obj.longitude], 2, {
        color: 'none',
        fillColor: '#000',
        fillOpacity: 1.0
    }).addTo(edit_cell_coverage_lg).addTo( edit_cell_map );

    // and a transparent circle for coverage 
    L.circle([edit_cell_tmp_obj.latitude,edit_cell_tmp_obj.longitude], edit_cell_tmp_obj.radius, {
        color: 'none',
        fillColor: '#000',
        fillOpacity: 0.1
    }).addTo(edit_cell_coverage_lg).addTo( edit_cell_map );
    
    edit_cell_map.setView(
        {
            lat: edit_cell_tmp_obj.latitude,
            lon: edit_cell_tmp_obj.longitude
        },
        17 // zoom level
    );

    // add a solid-color small circle (dot)
    edit_cell_circle_dot = L.circle([edit_cell_tmp_obj.latitude,(edit_cell_tmp_obj.new_longitude)], 2, {
        color: 'none',
        fillColor: '#2686de',
        fillOpacity: 1.0
    }).addTo(edit_cell_coverage_lg).addTo( edit_cell_map );

    // add a transparent circle for coverage 
    edit_cell_circle_cov = L.circle([edit_cell_tmp_obj.latitude,(edit_cell_tmp_obj.new_longitude)], edit_cell_tmp_obj.radius, {
        color: 'none',
        fillColor: '#2686de',
        fillOpacity: 0.2
    }).addTo(edit_cell_coverage_lg).addTo( edit_cell_map );
}


function ui_show_add_cell_modal(  ) {

    if (gNBs.length == 0) {
        ui_display_toast_msg("warning", "Oups! Add a gNB first.", "You cannot add new cells without first having at least one gNB.");
        return;
    }

    add_cell_coverage_lg.clearLayers(); // map layer cleanup

    // refresh the gNB options in the select input
    $('#add_cell_gNB').empty(); // delete the old ones
    // $('#add_cell_gNB').append($('<option>', { value: -1, text: "none" })); // add a prompt
    $.each(gNBs, function (i, item) {

        var data = { 
            value: item.id,
            text : item.gNB_id
        };

        $('#add_cell_gNB').append($('<option>', data));
    });

    add_cell_modal.show();

    add_cell_map.invalidateSize(); // this helps the map display its tiles correctly after the size of the modal is finalized

    add_cell_circle_dot = L.circle([48.499998, 23.383331], 2, { // Geographical midpoint of Europe
        color: 'none',
        fillColor: '#2686de',
        fillOpacity: 1.0
    }).addTo(add_cell_coverage_lg).addTo( add_cell_map );

    // add a transparent circle for coverage 
    add_cell_circle_cov = L.circle([48.499998, 23.383331], 150, { // Geographical midpoint of Europe
        color: 'none',
        fillColor: '#2686de',
        fillOpacity: 0.2
    }).addTo(add_cell_coverage_lg).addTo( add_cell_map );

    // if cells have been added
    // display them and
    // set bounds for view + zoom depending on their position
    if ( cells.length > 0 ) {

        // iterate and add cells to map
        for (const item of cells) {

            // add a solid-color small circle (dot)
            L.circle([item.latitude,(item.longitude)], 2, {
                color: 'none',
                fillColor: '#2686de',
                fillOpacity: 1.0
            }).addTo(add_cell_coverage_lg).addTo( add_cell_map );
        
            // add a transparent circle for coverage 
            L.circle([item.latitude,(item.longitude)], item.radius, {
                color: 'none',
                fillColor: '#2686de',
                fillOpacity: 0.2
            }).addTo(add_cell_coverage_lg).addTo( add_cell_map );
        }
        

        // set map bounds
        var map_bounds     = helper_calculate_map_bounds_from_cells();            
        var leaflet_bounds = new L.LatLngBounds(map_bounds);

        add_cell_map.fitBounds( leaflet_bounds );

        // fix high zoom level edge-case
        if (add_cell_map.getZoom() > 17) { add_cell_map.setZoom(17); } 
    }
}


function ui_initialize_edit_cell_map() {

    // set map height
    $('#edit_cell_mapid').css({ "height": 600 } );

    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9',    tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23}),
        streets     = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23});


    // map initialization
    edit_cell_map = L.map('edit_cell_mapid', {
        layers: [grayscale, edit_cell_coverage_lg]
    }).setView([48.499998, 23.383331], 5);    // Geographical midpoint of Europe


    var baseLayers = {
            "Grayscale": grayscale,
            "Streets": streets
        };

    var overlays = {
        "cell coverage": edit_cell_coverage_lg,
    };

    L.control.layers(baseLayers, overlays).addTo(edit_cell_map);
}



function ui_initialize_add_cell_map() {

    // set map height
    $('#add_cell_mapid').css({ "height": 600 } );

    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9',    tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23}),
        streets     = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23});


    // map initialization
    add_cell_map = L.map('add_cell_mapid', {
        layers: [grayscale, add_cell_coverage_lg]
    }).setView([48.499998, 23.383331], 5);    // Geographical midpoint of Europe


    var baseLayers = {
            "Grayscale": grayscale,
            "Streets": streets
        };

    var overlays = {
        "cell coverage": add_cell_coverage_lg,
    };

    L.control.layers(baseLayers, overlays).addTo(add_cell_map);

    
}



function ui_edit_cell_modal_add_listeners() {

    $('#edit_cell_new_rad').on('change', function(){
        edit_cell_tmp_obj.new_radius = $('#edit_cell_new_rad').val();
        edit_cell_circle_cov.setRadius(edit_cell_tmp_obj.new_radius);
    });

    function edit_cell_onMapClick(e) {
        // console.log(e);
        edit_cell_circle_dot.setLatLng(e.latlng);
        edit_cell_circle_cov.setLatLng(e.latlng);
        edit_cell_circle_cov.setRadius(edit_cell_tmp_obj.new_radius);

        edit_cell_tmp_obj.new_latitude  = parseFloat( e.latlng.lat.toFixed(6) );
        edit_cell_tmp_obj.new_longitude = parseFloat( e.latlng.lng.toFixed(6) );

        $('#edit_cell_new_lat').val( edit_cell_tmp_obj.new_latitude );
        $('#edit_cell_new_lon').val( edit_cell_tmp_obj.new_longitude );
    }

    edit_cell_map.on('click', edit_cell_onMapClick);
}



function ui_add_cell_modal_add_listeners() {

    $('#add_cell_new_rad').on('change', function(){
        add_cell_circle_cov.setRadius( parseInt( $('#add_cell_new_rad').val() ) );
    });

    function add_cell_onMapClick(e) {
        add_cell_circle_dot.setLatLng(e.latlng);
        add_cell_circle_cov.setLatLng(e.latlng);
        add_cell_circle_cov.setRadius( parseInt( $('#add_cell_new_rad').val() ) );

        $('#add_cell_new_lat').val( parseFloat( e.latlng.lat.toFixed(6) ) );
        $('#add_cell_new_lon').val( parseFloat( e.latlng.lng.toFixed(6) ) );
    }

    add_cell_map.on('click', add_cell_onMapClick);
}
// ===============================================
//               End of UI functions
// ===============================================












// ===============================================
//                Helper functions
// ===============================================


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



// helper function to return an array of latitude,longitude pairs
// that will be later used by leaflet to set bounds to a map
// 
function helper_calculate_map_bounds_from_cells(  ) {
    
    var map_bounds = [];

    for (const item of cells) {
        map_bounds.push( [ item.latitude, item.longitude ] );
    }
    return map_bounds;
}

// ===============================================
//             End of Helper functions
// ===============================================

