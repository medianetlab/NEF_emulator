// ===============================================
//                 Document ready
// ===============================================
$( document ).ready(function() {
    api_get_gNBs();
    api_get_Cells()
    api_get_UEs()
    api_get_paths()


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

// ===============================================
//               End of UI functions
// ===============================================
