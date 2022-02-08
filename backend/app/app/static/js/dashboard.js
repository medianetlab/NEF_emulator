// ===============================================
//                 Document ready
// ===============================================
$( document ).ready(function() {

    ui_fetch_and_update_gNBs_data();
    ui_fetch_and_update_cells_data();
    ui_fetch_and_update_ues_data();
    ui_fetch_and_update_paths_data();


    // =========================================================
    //                  MODAL BUTTONS LISTENERS
    //                (Create - Update - Delete)
    // =========================================================
    // add listeners to buttons for CUD operations
    // these buttons are on the bottom right of every modal
    // and they trigger API calls to:
    //   C: CREATE (add new items)
    //   U: UPDATE (edit existing items)
    //   D: DELETE (remove items)
    // 
        ui_add_btn_listeners_for_gNBs_CUD_operations();
        ui_add_btn_listeners_for_cells_CUD_operations();
        ui_add_btn_listeners_for_UEs_CUD_operations();
        ui_add_btn_listeners_for_paths_CUD_operations();


    // =========================================================
    //                   MAP INITIALIZATION &
    //                 MODAL-SPECIFIC LISTENERS
    //         (clicks on maps, changes on inputs etc...)
    // =========================================================
    //
        // initialize the map used inside the "edit cell" modal
        // and add listeners to capture user changes (map & radius)
        ui_initialize_edit_cell_map();
        ui_edit_cell_modal_add_listeners();

        // initialize the map used inside the "add cell" modal
        // and add listeners to capture user changes (map & radius)
        ui_initialize_add_cell_map();
        ui_add_cell_modal_add_listeners();


        // initialize the map used inside the "edit UE" / "add UE" modals
        // and add listeners to capture user changes (path selection)
        ui_initialize_edit_UE_map();
        ui_initialize_add_UE_map();
        ui_edit_UE_modal_add_listeners();
        ui_add_UE_modal_add_listeners();


        // initialize the map used inside the "edit path" / "add path" modals
        // and add listeners to capture user changes (colors, click on map etc...)
        ui_initialize_edit_path_map();
        ui_initialize_add_path_map();
        ui_edit_path_modal_add_listeners();
        ui_add_path_modal_add_listeners();


});
// ===============================================
//             End of Document ready
// ===============================================






// ===============================================
//                  UI functions
// ===============================================

// updates the numbers displayed on every card
// 
function ui_update_card( element_id, number ) {
    $( element_id ).html(number);
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



function ui_draw_Cells_to_map(map, cells_layer, coverage_layer, fillColor) {

    // if cells have been added
    // display them
    if ( cells.length > 0 ) {

        // iterate and add cells to map
        for (const item of cells) {

            // add a solid-color small circle (dot)
            L.circle([item.latitude,(item.longitude)], 2, {
                color: 'none',
                fillColor: fillColor,
                fillOpacity: 0.6
            }).addTo( cells_layer ).addTo( map );
        
            // add a transparent circle for coverage 
            L.circle([item.latitude,(item.longitude)], item.radius, {
                color: 'none',
                fillColor: fillColor,
                fillOpacity: 0.05
            }).addTo( coverage_layer ).addTo( map );
        }
    }
}



function ui_draw_Cells_to_map_excluding_selected(map, cells_layer, coverage_layer, fillColor, selected_cell_id) {

    // if cells have been added
    // display them
    if ( cells.length > 0 ) {

        // iterate and add cells to map
        for (const item of cells) {

            if ( item.cell_id == selected_cell_id ) { continue; }

            // add a solid-color small circle (dot)
            L.circle([item.latitude,(item.longitude)], 2, {
                color: 'none',
                fillColor: fillColor,
                fillOpacity: 0.6
            }).addTo( cells_layer ).addTo( map );
        
            // add a transparent circle for coverage 
            L.circle([item.latitude,(item.longitude)], item.radius, {
                color: 'none',
                fillColor: fillColor,
                fillOpacity: 0.05
            }).addTo( coverage_layer ).addTo( map );
        }
    }
}



function ui_draw_UEs_to_map(map, ues_layer) {
    // if UEs have been added, display them
    if ( ues.length > 0 ) {

      // iterate and add ues to map
      for (const ue of ues) {
        // create markers - this will be executed only once!
        var walk_icon = L.divIcon({
            className: 'emu-pin-box',
            iconSize: L.point(30,42),
            iconAnchor: L.point(15,42),
            popupAnchor: L.point(0,-38),
            tooltipAnchor: L.point(0,0),
            html: '<div class="pin-bg pin-bg-walk"></div>\
                   <div class="pin-icon ion-md-walk"></div>'
        });
        
        L.marker([ue.latitude,ue.longitude], {icon: walk_icon}).addTo( map )
            .bindTooltip(ue.ip_address_v4)
            .bindPopup("<b>"+ ue.name +"</b><br />"+
                       // ue.description +"<br />"+
                       "location: ["  + ue.latitude.toFixed(6) + "," + ue.longitude.toFixed(6) +"]<br />"+
                       "Cell ID: " + ue.cell_id_hex +"<br />"+
                       "External identifier: " + ue.external_identifier +"<br />"+
                       "Speed:"+ ue.speed)
            .addTo( ues_layer ); // add to layer group
        }        
    }
}




function ui_draw_paths_to_map(map, path_layer, opacity) {
    // display paths if any
    if ( paths.length > 0 ) {
      
      // iterate and add paths to map
      for (const path of paths) {
        // paint the current path of the path
        api_get_specific_path_callback( path.id, function(data){
            // console.log(data);
            ui_map_paint_path(data, map, path_layer, opacity);
        });
      }
    }
}



function ui_map_fit_bounds_to_cells( map ) {
    // if cells have been added
    // display them and
    // set bounds for view + zoom depending on their position
    if ( cells.length > 0 ) {
        // set map bounds
        var map_bounds     = helper_calculate_map_bounds_from_cells();
        var leaflet_bounds = new L.LatLngBounds(map_bounds);

        map.fitBounds( leaflet_bounds );

        // fix high zoom level edge-case
        if (map.getZoom() > 17) { map.setZoom(17); }
    }
}

// ===============================================
//               End of UI functions
// ===============================================
