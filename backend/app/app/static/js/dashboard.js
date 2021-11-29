// ===============================================
//               Global variables
// ===============================================
var gNBs  = null;
var cells = null;
var ues   = null;
var paths = null;

var db_ID_to_gNB_id  = {};

var gNBs_datatable  = null;
var cells_datatable = null;
var ues_datatable   = null;
var paths_datatable = null;





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




// gNB modals initialization and helper variables
// ==============================================
    var  del_gNB_modal = new coreui.Modal(document.getElementById( 'del_gNB_modal'), {});
    var edit_gNB_modal = new coreui.Modal(document.getElementById('edit_gNB_modal'), {});
    var  add_gNB_modal = new coreui.Modal(document.getElementById( 'add_gNB_modal'), {});
    var gNB_to_be_deleted = -1;
    var gNB_to_be_edited  = -1;
    var gNB_tmp_obj       = null;
    


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



// UE modals initialization and helper variables
// ===============================================
    var  del_UE_modal    = new coreui.Modal(document.getElementById( 'del_UE_modal'), {});
    var edit_UE_modal    = new coreui.Modal(document.getElementById('edit_UE_modal'), {});
    var  add_UE_modal    = new coreui.Modal(document.getElementById( 'add_UE_modal'), {});
    var UE_to_be_deleted = -1;
    var UE_to_be_edited  = -1;
    var edit_UE_tmp_obj  = null;

    // leaflet.js map for editing UE modal
    var edit_UE_map         = null;
    var edit_UE_position_lg = L.layerGroup(); // map layer group for UEs
    var edit_UE_path_lg     = L.layerGroup(); // map layer group for paths
    var edit_UE_circle_dot  = null;           // small circle depicting the position of the UE (to be edited)
    // leaflet.js map for adding UE modal
    var add_UE_map          = null;
    var add_UE_position_lg  = L.layerGroup(); // map layer group for UEs
    var add_UE_path_lg      = L.layerGroup(); // map layer group for paths
    var add_UE_circle_dot   = null;           // small circle depicting the position of the UE (to be edited)



// path modals initialization and helper variables
// ===============================================
    var  del_path_modal = new coreui.Modal(document.getElementById( 'del_path_modal'), {});
    var edit_path_modal = new coreui.Modal(document.getElementById('edit_path_modal'), {});
    // var  add_path_modal = new coreui.Modal(document.getElementById('add_path_modal'),  {});
    var path_to_be_deleted   = -1;
    var path_to_be_edited    = -1;
    var edit_path_tmp_obj    = null;
    var edit_path_tmp_points = null;

    // leaflet.js map for editing UE modal
    var edit_path_map         = null;
    var edit_path_path_lg     = L.layerGroup(); // map layer group for path
    var edit_path_points_lg   = L.layerGroup(); // map layer group for UEs
    var edit_path_start_dot   = null;           // small circle depicting the starting point of the path (to be edited)
    var edit_path_end_dot     = null;           // small circle depicting the   ending point of the path (to be edited)

// ===============================================
//             End of Global variables
// ===============================================











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
        ui_initialize_edit_UE_map();
        ui_initialize_add_UE_map();
        ui_add_UE_modal_add_listeners();


        // initialize the map used inside the "edit path" / "add path" modals
        ui_initialize_edit_path_map();
        // ui_initialize_add_path_map();
        ui_edit_path_modal_add_listeners();


});
// ===============================================
//             End of Document ready
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
    
    var url = app.api_url + '/paths/?skip=0&limit=100';

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
            ui_init_datatable_paths();
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
            
            helper_delete_UE( UE_supi );
            // helper_create_db_id_to_UE_id_bindings();
            ues_datatable.clear().rows.add( ues ).draw();
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
            
            helper_update_gNB( data );
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
            
            helper_update_cell( data );
            
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


// Ajax request to update UE
// on success: update it inside datatables too
// 
function api_put_UE( UE_obj ) {
    
    var url = app.api_url + '/UEs/' + UE_to_be_edited; // using UE_obj.UE_id would not work if the user has provided new UE_id value

    var UE_obj_copy =  JSON.parse(JSON.stringify( UE_obj )); // copy to be used with fewer object properties

    // remove not required properties
    delete UE_obj_copy.id;
    delete UE_obj_copy.owner_id;

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
            
            helper_update_UE( data );
            
            ues_datatable.clear().rows.add( ues ).draw();
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


// Ajax request to create Cell
// on success: add it inside datatables too
// 
function api_post_cell( cell_obj ) {

    // console.log(cell_obj);
    
    var url = app.api_url + '/Cells/';

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
            
            cells.push(data);
            // helper_create_db_id_to_gNB_id_bindings();
            cells_datatable.clear().rows.add( cells ).draw();
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



// Ajax request to create UE
// on success: add it inside datatables too
// 
function api_post_UE( UE_obj ) {

    // console.log(cell_obj);
    
    var url = app.api_url + '/UEs/';

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
            
            ues.push(data);
            // helper_create_db_id_to_gNB_id_bindings();
            ues_datatable.clear().rows.add( ues ).draw();
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
                "targets": 7,
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
            { "data": "description" },
            { "data": "Cell_id", className: "dt-center" },
            { "data": "ip_address_v4", className: "dt-center" },
            { "data": "mac_address", className: "dt-center" },
            { "data": "speed", className: "dt-center" },
            { "data": null, className: "dt-right" },
        ]
    } );
}



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

    edit_cell_coverage_lg.clearLayers(); // map layer cleanup

    cell_to_be_edited = cell_id;

    edit_cell_tmp_obj = helper_find_cell( cell_id );

    // prepare new location values
    edit_cell_tmp_obj["new_latitude"]  = edit_cell_tmp_obj.latitude;
    edit_cell_tmp_obj["new_longitude"] = edit_cell_tmp_obj.longitude + 0.001; // shift it a little bit right
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

    // add a solid-color small circle (dot) some meters away
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
    $('#add_cell_gNB').append($('<option>', { value: -1, text: "none" })); // add a prompt
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
    edit_UE_path_lg.clearLayers();     // map path layer cleanup

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
    L.circle([edit_UE_tmp_obj.latitude,edit_UE_tmp_obj.longitude], 3, {
        color: 'none',
        fillColor: '#3590e2',
        fillOpacity: 1.0
    }).addTo(edit_UE_position_lg).addTo( edit_UE_map );

    // paint the current path of the UE
    api_get_specific_path_callback( edit_UE_tmp_obj.path_id, function(data){
        // console.log(data);
        ui_map_paint_path(data, edit_UE_map, edit_UE_path_lg);
    });
    
    edit_UE_map.setView(
        {
            lat: edit_UE_tmp_obj.latitude,
            lon: edit_UE_tmp_obj.longitude
        },
        18 // zoom level
    );
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


// iterates through the UEs list
// and removes (if found) the supi provided
// 
function helper_delete_UE( UE_supi ) {

    var i = ues.length;
    while (i--) {
        if ( ues[i].supi == UE_supi ) {
            ues.splice(i, 1);
        }
    }
}


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

// iterates through the UE list
// and updates (if found) the UE object provided
//
function helper_update_UE( UE_obj ) {

    for (i=0 ; i<ues.length ; i++) {
        if ( ues[i].id == UE_obj.id ) {
            ues[i] = JSON.parse(JSON.stringify( UE_obj )); // found, updated
        }
    }
}


// iterates through the path list
// and returns a copy of the path object with the path_id provided
// (if not found it returns null)
// 
function helper_find_path( path_id ) {
    for (const item of paths) {
        if ( item.id == path_id ) {
            return JSON.parse(JSON.stringify( item )); // return a copy of the item
        }
    }
    return null;
}

// iterates through the path list
// and updates (if found) the path object provided
//
function helper_update_path( path_obj ) {

    console.log(path_obj);

    for (i=0 ; i<paths.length ; i++) {
        if ( paths[i].id == path_obj.id ) {
            console.log(paths[i]);
            paths[i] = JSON.parse(JSON.stringify( path_obj )); // found, updated
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



function ui_add_btn_listeners_for_UEs_CUD_operations() {

    // CREATE
    $('#add_UE_btn').on('click', function(){

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
          path_id             : parseInt( $('#add_UE_path').val() ),
          speed               : $('#add_UE_speed').val(),
          gNB_id              : 1,
          Cell_id             : 1,
        };

        api_post_UE( data );
        add_UE_modal.hide();
    });

    // DELETE
    $('#del_UE_btn').on('click', function(){
        api_delete_UE( UE_to_be_deleted );
        del_UE_modal.hide();
    });

    // UPDATE
    $('#update_UE_btn').on('click', function(){
        
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
        edit_UE_tmp_obj.path_id = parseInt( $('#edit_UE_path').val() );
        edit_UE_tmp_obj.speed   = $('#edit_UE_speed').val();

        delete edit_UE_tmp_obj.supi;
        delete edit_UE_tmp_obj.latitude;
        delete edit_UE_tmp_obj.longitude;
        delete edit_UE_tmp_obj.cell_id_hex;

        api_put_UE( edit_UE_tmp_obj );
        edit_UE_modal.hide();
    });
}



function ui_add_btn_listeners_for_paths_CUD_operations() {

    // CREATE
    // $('#add_path_btn').on('click', function(){

    //     var data = {
    //       cell_id     : $('#add_cell_id').val(),
    //       name        : $('#add_cell_name').val(),
    //       gNB_id      : parseInt ( $('#add_cell_gNB').val() ),
    //       description : $('#add_cell_description').val(),
    //       latitude    : parseFloat( $('#add_cell_new_lat').val() ),
    //       longitude   : parseFloat( $('#add_cell_new_lon').val() ),
    //       radius      :   parseInt( $('#add_cell_new_rad').val() ),
    //     };

    //     api_post_cell( data );
    //     add_cell_modal.hide();
    // });

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



function ui_initialize_edit_cell_map() {

    // set map height
    $('#edit_cell_mapid').css({ "height": 300 } );

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


function ui_initialize_edit_UE_map() {

    // set map height
    $('#edit_UE_mapid').css({ "height": 300 } );

    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9',    tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23}),
        streets     = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23});


    // map initialization
    edit_UE_map = L.map('edit_UE_mapid', {
        layers: [grayscale, edit_UE_position_lg, edit_UE_path_lg]
    }).setView([48.499998, 23.383331], 5);    // Geographical midpoint of Europe


    var baseLayers = {
            "Grayscale": grayscale,
            "Streets": streets
        };

    var overlays = {
        "UE position": edit_UE_position_lg,
        "path": edit_UE_path_lg,
    };

    L.control.layers(baseLayers, overlays).addTo(edit_UE_map);

}



function ui_initialize_add_UE_map() {

    // set map height
    $('#add_UE_mapid').css({ "height": 300 } );

    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9',    tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23}),
        streets     = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23});


    // map initialization
    add_UE_map = L.map('add_UE_mapid', {
        layers: [grayscale, add_UE_position_lg, add_UE_path_lg]
    }).setView([48.499998, 23.383331], 5);    // Geographical midpoint of Europe


    var baseLayers = {
            "Grayscale": grayscale,
            "Streets": streets
        };

    var overlays = {
        "UE position": add_UE_position_lg,
        "path": add_UE_path_lg,
    };

    L.control.layers(baseLayers, overlays).addTo(add_UE_map);

    
}



function ui_initialize_add_cell_map() {

    // set map height
    $('#add_cell_mapid').css({ "height": 300 } );

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



function ui_add_UE_modal_add_listeners() {

    $('#add_UE_path').on('change', function(){
        selected_path_id = $(this).val();

        // add path to map
        // and set view + zoom level
        api_get_specific_path_callback( selected_path_id, function(data){
            add_UE_path_lg.clearLayers();
            ui_map_paint_path(data, add_UE_map, add_UE_path_lg);

            // set bounds for view + zoom depending on the position of cells
            var map_bounds     = helper_calculate_map_bounds_from_cells();            
            var leaflet_bounds = new L.LatLngBounds(map_bounds);

            add_UE_map.fitBounds( leaflet_bounds );
            // add_UE_map.setZoom(17);
        });
    });
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