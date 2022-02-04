// ===============================================
//               Global variables
// ===============================================
var paths = null;
var paths_datatable = null;

// templates for buttons added to datatbles rows (DELETE / EDIT)
// =============================================================
    // delete path
    var del_path_btn_tpl = `<button class="btn btn-sm btn-outline-secondary" type="button" onclick="ui_show_delete_path_modal( '{{id}}' );">
      <svg class="icon">
        <use xlink:href="static/vendors/@coreui/icons/svg/free.svg#cil-trash"></use>
      </svg>
    </button>`;

    // edit path
    var edit_path_btn_tpl = `<button class="btn btn-sm btn-outline-dark" type="button" onclick="ui_show_edit_path_modal( {{id}} );">
      <svg class="icon">
        <use xlink:href="static/vendors/@coreui/icons/svg/free.svg#cil-pencil"></use>
      </svg>
    </button>`;




// path modals initialization and helper variables
// ===============================================
    var  del_path_modal = new coreui.Modal(document.getElementById( 'del_path_modal'), {});
    var edit_path_modal = new coreui.Modal(document.getElementById('edit_path_modal'), {});
    var  add_path_modal = new coreui.Modal(document.getElementById('add_path_modal'),  {});
    var path_to_be_deleted   = -1;
    var path_to_be_edited    = -1;
    var edit_path_tmp_obj    = null;
    var edit_path_tmp_points = null;
    var add_path_tmp_obj     = null;

    // leaflet.js map for editing UE modal
    var edit_path_map         = null;
    var edit_path_path_lg     = L.layerGroup(); // map layer group for path
    var edit_path_points_lg   = L.layerGroup(); // map layer group for start/end points
    var edit_path_start_dot   = null;           // small circle depicting the starting point of the path (to be edited)
    var edit_path_end_dot     = null;           // small circle depicting the   ending point of the path (to be edited)
    // leaflet.js map for adding UE modal
    var add_path_map         = null;
    var add_path_path_lg     = L.layerGroup(); // map layer group for path
    var add_path_points_lg   = L.layerGroup(); // map layer group for start/end points
    var add_path_start_dot   = null;           // small circle depicting the starting point of the path (to be added)
    var add_path_end_dot     = null;           // small circle depicting the   ending point of the path (to be added)
    var add_path_polyline    = null;
    var pointA = null;
    var pointB = null;

// ===============================================
//             End of Global variables
// ===============================================









// ===============================================
//                 API functions
// ===============================================

// Ajax request to get Paths data
// on success: update the card at the top of the page
// and fill the datatable with values
// 
function api_get_paths() {
    
    var url = app.api_url + '/paths?skip=0&limit=100';

    $.ajax({
        type: 'GET',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        processData:  false,
        beforeSend: function() {
            $('.card-paths       .spinner-grow-sm').show();
            $('.card-table-paths .spinner-border' ).show();
        },
        success: function(data)
        {
            console.log(data);
            paths = data;
            ui_update_card( '#num-paths-card' , paths.length );
            ui_init_datatable_paths();
        },
        error: function(err)
        {
            console.log(err);
        },
        complete: function()
        {
            $('.card-paths       .spinner-grow-sm').hide();
            $('.card-table-paths .spinner-border' ).hide();
        },
        timeout: 5000
    });
}

// Ajax request to delete path
// on success: remove it from datatables too
// 
function api_delete_path( path_id ) {
    
    var url = app.api_url + '/paths/' + path_id;

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
            ui_display_toast_msg("success", "Success!", "The path has been permanently deleted");
            
            helper_delete_path( path_id );
            paths_datatable.clear().rows.add( paths ).draw();
            ui_update_card( '#num-paths-card' , paths.length );
        },
        error: function(err)
        {
            // console.log(err);
            ui_display_toast_msg("error", "Error: path could not be deleted", err.responseJSON.detail);
        },
        complete: function()
        {
            // 
        },
        timeout: 5000
    });
}

// Ajax request to update path
// on success: update it inside datatables too
// 
function api_put_path( path_obj ) {
    
    var url = app.api_url + '/paths/' + path_to_be_edited;

    var path_obj_copy =  JSON.parse(JSON.stringify( path_obj )); // copy to be used with fewer object properties

    // remove not required properties
    delete path_obj_copy.id;
    delete path_obj_copy.start_point;
    delete path_obj_copy.end_point;

    $.ajax({
        type: 'PUT',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        data:         JSON.stringify(path_obj_copy),
        processData:  false,
        beforeSend: function() {
            // 
        },
        success: function(data)
        {
            // console.log(data);
            ui_display_toast_msg("success", "Success!", "The Path has been updated");
            
            helper_update_path( data );
            
            paths_datatable.clear().rows.add( paths ).draw();
        },
        error: function(err)
        {
            console.log(err);
            ui_display_toast_msg("error", "Error: Path could not be updated", err.responseJSON.detail);
        },
        complete: function()
        {
            // 
        },
        timeout: 5000
    });
}

// Ajax request to associate UE with paths
// on success: update it inside datatables too
// 
function api_post_assign_path( UE_supi, path_id ) {
    
    var url = app.api_url + '/UEs/associate/path'; // using UE_obj.UE_id would not work if the user has provided new UE_id value

    var data ={
            "supi": UE_supi,
            "path": path_id
          };

    $.ajax({
        type: 'POST',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        data:         JSON.stringify(data),
        processData:  false,
        beforeSend: function() {
            // 
        },
        success: function(data)
        {
            // console.log(data);
            ui_display_toast_msg("success", "Success!", "The path has been assigned");
            
            // update local UE obj
            helper_update_UE_path(UE_supi, path_id);
            ues_datatable.clear().rows.add( ues ).draw();
        },
        error: function(err)
        {
            console.log(err);
            ui_display_toast_msg("error", "Error: The path could not be assigned", err.responseJSON.detail);
        },
        complete: function()
        {
            // 
        },
        timeout: 5000
    });
}

// Ajax request to create path
// on success: add it inside datatables too
// 
function api_post_path( path_obj ) {
    
    var url = app.api_url + '/paths';

    $.ajax({
        type: 'POST',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        data:         JSON.stringify(path_obj),
        processData:  false,
        beforeSend: function() {
            // 
        },
        success: function(data)
        {
            // console.log(data);
            ui_display_toast_msg("success", "Success!", "The path has been created");
            
            paths.push(data);
            paths_datatable.clear().rows.add( paths ).draw();
            ui_add_path_modal_reset_form();
            ui_update_card( '#num-paths-card' , paths.length );
        },
        error: function(err)
        {
            console.log(err);
            ui_display_toast_msg("error", "Error: path could not be created", err.responseJSON.detail[0].msg);
        },
        complete: function()
        {
            // 
        },
        timeout: 5000
    });
}

// Ajax request to get specific Path data
// on success: callback()
// 
function api_get_specific_path_callback( id, callback  ) {
    
    var url = app.api_url + '/paths/' + id;

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
            // console.log(data);
            // paths = data;
            callback(data);
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

function ui_init_datatable_paths() {
    paths_datatable = $('#dt-paths').DataTable( {
        data: paths,
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        pageLength: -1,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
        columnDefs: [
            {
                "targets": 3,
                "data": null,
                "defaultContent": '',
                "orderable" : false,
                "searchable": false,
                "render": function ( data, type, row ) {
                    // return row.id;
                    return  (  del_path_btn_tpl.replaceAll("{{id}}", row.id) + " " +
                              edit_path_btn_tpl.replaceAll("{{id}}", row.id) );
                }
            }
        ],
        columns: [
            { "data": "id", className: "dt-center" },
            { "data": "description" },
            { "data": "color" },
            { "data": null, className: "dt-right" },
        ]
    } );
}
// ===============================================
//           End of Datatable functions
// ===============================================





// ===============================================
//                  UI functions
// ===============================================


// adds listeners for CUD operations regarding Paths
//   C: CREATE (add)
//   U: UPDATE (edit)
//   D: DELETE
// The steps are more or less:
//  - show the relevant modal message
//  - call the relevant API call
//  - hide the modal message
// 
function ui_add_btn_listeners_for_paths_CUD_operations() {

    // CREATE
    $('#add_path_btn').on('click', function(){

        add_path_tmp_obj.description  = $('#add_path_description').val();
        add_path_tmp_obj.color        = $('#add_path_color').val();

        // test color string added by user
        if ( /^#([0-9A-F]{3}){1,2}$/i.test( $('#add_path_color').val() ) ) {
            api_post_path( add_path_tmp_obj );
            add_path_modal.hide();
        } else {
            ui_display_toast_msg("error", "Error: not a valid color", "A valid hex color value must be used.");
        }
    });

    // DELETE
    $('#del_path_btn').on('click', function(){
        api_delete_path( path_to_be_deleted );
        del_path_modal.hide();
    });

    // UPDATE
    $('#update_path_btn').on('click', function(){
        
        // get possible changes from form
        edit_path_tmp_obj.description  = $('#edit_path_description').val();
        edit_path_tmp_obj.color        = $('#edit_path_color').val();


        // test color string added by user
        if ( /^#([0-9A-F]{3}){1,2}$/i.test( $('#edit_path_color').val() ) ) {
            api_put_path( edit_path_tmp_obj );
            edit_path_modal.hide();
        } else {
            ui_display_toast_msg("error", "Error: not a valid color", "A valid hex color value must be used.");
        }
    });    
}


function ui_show_delete_path_modal( path_id ) {

    path_to_be_deleted = path_id;
    del_path_modal.show();

}



// shows modal for editing paths
// looks up for the specific path and loads its details to the form fields
//   - the user is allowed to modify only Description and color
// 
function ui_show_edit_path_modal( path_id ) {

    edit_path_path_lg.clearLayers();     // map path layer cleanup

    path_to_be_edited = path_id;

    edit_path_tmp_obj = helper_find_path( path_id );
    
    // load values to the input fields
    $('#db_path_id').val( edit_path_tmp_obj.id );
    $('#edit_path_description').val( edit_path_tmp_obj.description );
    $('#edit_path_color').val( edit_path_tmp_obj.color );
    $('#edit_path_color_preview').css('background-color', edit_path_tmp_obj.color);
    
    $('#edit_path_start_lat').html( edit_path_tmp_obj.start_point.latitude  );
    $('#edit_path_start_lon').html( edit_path_tmp_obj.start_point.longitude );
    $('#edit_path_end_lat'  ).html( edit_path_tmp_obj.end_point.latitude    );
    $('#edit_path_end_lon'  ).html( edit_path_tmp_obj.end_point.longitude   );
    
    

    edit_path_modal.show();
    edit_path_map.invalidateSize(); // this helps the map display its tiles correctly after the size of the modal is finalized

    // paint the current path of the path
    api_get_specific_path_callback( edit_path_tmp_obj.id, function(data){
        // console.log(data);
        edit_path_tmp_points = data;
        ui_map_paint_path(data, edit_path_map, edit_path_path_lg);
    });

    // add a solid-color small circle (dot) at the start lat,lon
    L.circle([edit_path_tmp_obj.start_point.latitude,edit_path_tmp_obj.start_point.longitude], 1, {
        color: 'none',
        fillColor: '#3590e2',
        fillOpacity: 1.0
    }).addTo(edit_path_points_lg ).addTo( edit_path_map );
    // add a solid-color small circle (dot) at the end lat,lon
    L.circle([edit_path_tmp_obj.end_point.latitude,edit_path_tmp_obj.end_point.longitude], 1, {
        color: 'none',
        fillColor: '#c7362c',
        fillOpacity: 1.0
    }).addTo(edit_path_points_lg).addTo( edit_path_map );
    
    // set bounds for view + zoom depending on the position of cells
    var map_bounds     = helper_calculate_map_bounds_from_cells();            
    var leaflet_bounds = new L.LatLngBounds(map_bounds);
    edit_path_map.fitBounds( leaflet_bounds );
    edit_path_map.setZoom(17);
}


// shows modal for adding paths
// 
// 
function ui_show_add_path_modal() {

    add_path_path_lg.clearLayers();     // map path layer cleanup

    add_path_tmp_obj = {
            description: "",
            start_point: {
                latitude  : null,
                longitude : null
            },
            end_point: {
                latitude  : null,
                longitude : null
            },
            color: "#3399ff",
            points: [],
    };


    add_path_modal.show();
    
    // set bounds for view + zoom depending on the position of cells (if any)
    if (cells.length > 0) {
        var map_bounds     = helper_calculate_map_bounds_from_cells();            
        var leaflet_bounds = new L.LatLngBounds(map_bounds);
        add_path_map.fitBounds( leaflet_bounds );
        add_path_map.setZoom(17);    
    }

    add_path_map.invalidateSize(); // this helps the map display its tiles correctly after the size of the modal is finalized
}



function ui_initialize_edit_path_map() {

    // set map height
    $('#edit_path_mapid').css({ "height": 600 } );

    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9',    tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23}),
        streets     = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23});


    // map initialization
    edit_path_map = L.map('edit_path_mapid', {
        layers: [grayscale, edit_path_points_lg, edit_path_path_lg ]
    }).setView([48.499998, 23.383331], 5);    // Geographical midpoint of Europe


    var baseLayers = {
            "Grayscale": grayscale,
            "Streets": streets
        };

    var overlays = {
        "path":   edit_path_path_lg,
        "points": edit_path_points_lg
    };

    L.control.layers(baseLayers, overlays).addTo(edit_path_map);

}



function ui_initialize_add_path_map() {

    // set map height
    $('#add_path_mapid').css({ "height": 600 } );

    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9',    tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23}),
        streets     = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23});


    // map initialization
    add_path_map = L.map('add_path_mapid', {
        layers: [grayscale, add_path_points_lg, add_path_path_lg ]
    }).setView([48.499998, 23.383331], 5);    // Geographical midpoint of Europe


    var baseLayers = {
            "Grayscale": grayscale,
            "Streets": streets
        };

    var overlays = {
        "path":   add_path_path_lg,
        "points": add_path_points_lg
    };

    L.control.layers(baseLayers, overlays).addTo(add_path_map);

    function onAddPathMapClick(e) {
        if (pointA == null) {
            pointA = e.latlng;
            
            
            add_path_tmp_obj.start_point.latitude  = parseFloat(e.latlng.lat.toFixed(6));
            add_path_tmp_obj.start_point.longitude = parseFloat(e.latlng.lng.toFixed(6));
            $('#add_path_start_lat').html( add_path_tmp_obj.start_point.latitude  );
            $('#add_path_start_lon').html( add_path_tmp_obj.start_point.longitude );

            // add a solid-color small circle (dot) at the start lat,lon
            add_path_start_dot = L.circle([add_path_tmp_obj.start_point.latitude,add_path_tmp_obj.start_point.longitude], 1, {
                color: 'none',
                fillColor: '#3590e2',
                fillOpacity: 1.0
            }).addTo(add_path_points_lg ).addTo( add_path_map );

            return;
        }
        if (pointB == null) {
            pointB = e.latlng;

            add_path_tmp_obj.end_point.latitude  = parseFloat(e.latlng.lat.toFixed(6));
            add_path_tmp_obj.end_point.longitude = parseFloat(e.latlng.lng.toFixed(6));
            $('#add_path_end_lat').html( add_path_tmp_obj.end_point.latitude  );
            $('#add_path_end_lon').html( add_path_tmp_obj.end_point.longitude );
            
            // add a solid-color small circle (dot) at the end lat,lon
            if (add_path_end_dot != null) { add_path_end_dot.remove(); }
            add_path_end_dot = L.circle([add_path_tmp_obj.end_point.latitude,add_path_tmp_obj.end_point.longitude], 1, {
                color: 'none',
                fillColor: '#c7362c',
                fillOpacity: 1.0
            }).addTo(add_path_points_lg).addTo( add_path_map );

            generate_coords_between_points(pointA.lat, pointA.lng, pointB.lat, pointB.lng);
            pointA = pointB;
            pointB = null;
        }
    }

    add_path_map.on('click', onAddPathMapClick);

}


function ui_add_path_modal_reset_form() {

    // form
    $('#add_path_description').val("");
    $('#add_path_color').val("#3399ff");
    $('#add_path_color').trigger('change');
    $('#add_path_start_lat').html("");
    $('#add_path_start_lon').html("");
    $('#add_path_end_lat').html("");
    $('#add_path_end_lon').html("");
    

    // leaflet js map
    if (add_path_start_dot) { add_path_start_dot.remove();      }
    if (add_path_end_dot  ) { add_path_end_dot.remove();        }
    if (add_path_polyline ) { add_path_polyline.remove();       }
    if (add_path_path_lg  ) { add_path_path_lg.clearLayers();   }
    if (add_path_points_lg) { add_path_points_lg.clearLayers(); }

    // data
    add_path_tmp_obj = {
            description: "",
            start_point: {
                latitude  : null,
                longitude : null
            },
            end_point: {
                latitude  : null,
                longitude : null
            },
            color: "#3399ff",
            points: [],
    };
    pointA = null;
    pointB = null;
}



function ui_edit_path_modal_add_listeners() {

    $('#edit_path_color').on('change', function(){

        var new_color = $(this).val();

        // test color string added by user
        if ( /^#([0-9A-F]{3}){1,2}$/i.test( new_color ) ) {

            $('#edit_path_color_preview').css('background-color', new_color);

            // redraw the path
            edit_path_path_lg.clearLayers();
            edit_path_tmp_points.color = new_color;

            ui_map_paint_path(edit_path_tmp_points, edit_path_map, edit_path_path_lg);
        } else {
            ui_display_toast_msg("error", "Error: not a valid color", "A valid hex color value must be used.");
        }
    });

    $('#edit_path_modal kbd').on('click', function(){
        $('#edit_path_color').val( $(this).html() );
        $('#edit_path_color').trigger('change');
    });

}



function ui_add_path_modal_add_listeners() {

    $('#add_path_color').on('change', function(){

        var new_color = $(this).val();

        // test color string added by user
        if ( /^#([0-9A-F]{3}){1,2}$/i.test( new_color ) ) {

            $('#add_path_color_preview').css('background-color', new_color);

            // redraw the path
            add_path_path_lg.clearLayers();
            add_path_tmp_obj.color = new_color;

            if ( add_path_polyline != null) { add_path_polyline.remove(); }

            var latlng   = helper_fix_points_format( add_path_tmp_obj.points );
            
            add_path_polyline = L.polyline(latlng, {
                color: add_path_tmp_obj.color,
                opacity: 0.2
            }).addTo( add_path_path_lg ).addTo( add_path_map );
            
        } else {
            ui_display_toast_msg("error", "Error: not a valid color", "A valid hex color value must be used.");
        }
    });

    $('#add_path_modal kbd').on('click', function(){
        $('#add_path_color').val( $(this).html() );
        $('#add_path_color').trigger('change');
    });


    $('#add_path_reset').on('click', function(){
        ui_add_path_modal_reset_form();
    });

    $('#add_path_modal').on('hide.coreui.modal', function (event) {
        ui_add_path_modal_reset_form();
    });
}


// Adds a path polyline to the leaflet js map
// to the specified layer.
// Calls a helper function "fix_points_format()"
// to prepare the data for leaflet.js format
// 
function ui_map_paint_path( data, map, layer ) {

    var latlng   = helper_fix_points_format( data.points );
    var polyline = L.polyline(latlng, {
        color: data.color,
        opacity: 0.2
    }).addTo( layer ).addTo(map);
}




// ===============================================
//                Helper functions
// ===============================================


// iterates through the paths list
// and removes (if found) the path_id provided
// 
function helper_delete_path( path_id ) {

    var i = paths.length;
    while (i--) {
        if ( paths[i].id == path_id ) {
            paths.splice(i, 1);
        }
    }
}


// iterates through the path list
// and returns a copy of the path object with the path_id provided
// (if not found it returns null)
// 
function helper_find_path( path_id ) {
    // console.log(path_id);
    for (const item of paths) {
        if ( item.id == path_id ) {
            // console.log(item);
            return JSON.parse(JSON.stringify( item )); // return a copy of the item
        }
    }
    return null;
}


// iterates through the path list
// and updates (if found) the path object provided
//
function helper_update_path( path_obj ) {

    for (i=0 ; i<paths.length ; i++) {
        if ( paths[i].id == path_obj.id ) {
            // console.log(paths[i]);
            paths[i] = JSON.parse(JSON.stringify( path_obj )); // found, updated
        }
    }
}


// Helper function
// Takes the data fetched from the API
// and returns them with a format appropriate
// leaflet.js
// 
function helper_fix_points_format( datapoints ) {

    // from (array of objects): [{latitude: 37.996095, longitude: 23.818562},{...}]
    // to   (array of arrays) : [[37.996095,23.818562],[...]

    var fixed = new Array(datapoints.length);
    
    for (i=0 ; i<datapoints.length ; i++) {
        fixed[i] = [datapoints[i].latitude , datapoints[i].longitude];
    }
    return fixed;
}

// ===============================================
//             End of Helper functions
// ===============================================






// ===============================================
//                  GEO functions
// ===============================================


// How to generate coordinates in between two known points
// https://stackoverflow.com/questions/22063201/how-to-generate-coordinates-in-between-two-known-points
function to_rad(num) {
    return num * Math.PI / 180;
}

function to_deg(num) {
    return num * 180 / Math.PI;
}

var R = 6371.0;

function waypoint(φ1, λ1, θ, d) {
    φ2 = Math.asin( Math.sin(φ1) * Math.cos(d/R) + Math.cos(φ1) * Math.sin(d/R) * Math.cos(θ) );
    λ2 = λ1 + Math.atan2( Math.sin(θ) * Math.sin(d/R) * Math.cos(φ1), Math.cos(d/R) - Math.sin(φ1) * Math.sin(φ2) );
    λ2 = (λ2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // normalise to -180..+180°
    return {'φ2': φ2, 'λ2': λ2};
}

function generate_coords_between_points(φ1, λ1, φ2, λ2){
    var φ1 = to_rad(φ1);
    var λ1 = to_rad(λ1);
    var φ2 = to_rad(φ2);
    var λ2 = to_rad(λ2);

    // var text_area = document.querySelector("#console");

    var d = R * Math.acos( Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1) );
    var θ = Math.atan2( Math.sin(λ2 - λ1) * Math.cos(φ2), Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1) );

    for (step=0.001 ; step<d ; step=step+0.001) {  // 0.001km = 1m
        point = waypoint(φ1, λ1, θ, step);
        lat  = to_deg(point.φ2);
        long = to_deg(point.λ2);


        lat  = lat.toFixed(6);  // keep only 6 decimal points
        long = long.toFixed(6); // keep only 6 decimal points

        // text_area.value += lat + "," + long + "\n";
        add_path_tmp_obj.points.push({"latitude": lat, "longitude": long});
    }

    if ( add_path_polyline != null) { add_path_polyline.remove(); }

    var latlng   = helper_fix_points_format( add_path_tmp_obj.points );
    
    add_path_polyline = L.polyline(latlng, {
        color: add_path_tmp_obj.color,
        opacity: 0.2
    }).addTo( add_path_path_lg ).addTo( add_path_map );
}

// ===============================================
//               End of GEO functions
// ===============================================

