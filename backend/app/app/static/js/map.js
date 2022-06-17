// ===============================================
//               Global variables
// ===============================================

// varialbles used for raw data,
// as they are fetched from the API
var mymap = null;
var gNBs  = null;
var cells = null;
var ues   = null;
var paths = null;


// variables used for painting / updating the map
//  map layer groups
var cells_lg         = L.layerGroup(),
    cell_coverage_lg = L.layerGroup(),
    ues_lg           = L.layerGroup(),
    paths_lg         = L.layerGroup();
//  markers
var ue_markers   = {};
var cell_markers = {};
var map_bounds   = [];
// helper var for correct initialization
var UEs_first_paint = true;

// for UE & map refresh
var UE_refresh_interval    = null;
var UE_refresh_sec_default = 1000; // 1 sec
var UE_refresh_sec         = -1;   // when select = "off" AND disabled = true

// template for UE buttons
var ue_btn_tpl = `<button class="btn btn-success btn-sm px-4 btn-ue" type="button" id="btn-ue-{{id}}" data-supi={{supi}} data-running=false>{{name}}</button> `

var looping_UEs = 0;

// variables used for events
var events                  = null;
var events_datatbl          = null;
var events_first_fetch      = true;
var latest_event_id_fetched = -1;

// for events & datatables refresh
var events_refresh_interval    = null;
var events_refresh_sec_default = 5000; // 5 sec
var events_refresh_sec         = 5000; // 5 sec

// template for Details buttons
var detail_btn_tpl = `<button class="btn btn-light" type="button" onclick="show_details_modal({{id}});">
  <svg class="icon">
    <use xlink:href="static/vendors/@coreui/icons/svg/free.svg#cil-fullscreen"></use>
  </svg>
</button>`;


// modal for details
var modal = new coreui.Modal(document.getElementById('details_modal'), {});

var paths_painted = [];

// ===============================================




// ===============================================
//                 Document ready
// ===============================================
$( document ).ready(function() {

    ui_initialize_map();

    // get UEs & Cells data and paint map
    api_get_UEs();
    api_get_Cells();


    // wait for ajax call to UEs endpoint
    // to initialize the UEs data
    let wait_for_UEs_data = function() {
      setTimeout(function () {
        if (ues === null)
          wait_for_UEs_data();
        else {
            // when ready,
            //  1. get and paint every path per UE
            //  2. create start/stop buttons
            for (const ue of ues) {

                // if no path selected, skip map paint and creation of button
                if (ue.path_id == 0) { continue; }

                // if not already fetched and painted, do so
                if ( !helper_check_path_is_already_painted( ue.path_id ) ) { 
                    api_get_specific_path(ue.path_id);
                    paths_painted.push(ue.path_id);
                }
                ui_generate_loop_btn_for( ue );
                ui_set_loop_btn_status_for( ue );
            }


            if ( ues.length >0 ) {
                ui_add_ue_btn_listeners();
                ui_add_ue_all_btn_listener();
            }
            else {
                $('#btn-start-all').removeClass("btn-success").addClass("btn-secondary").attr("disabled",true);
            }

            // edge case: UEs with no paths assigned --> disable button
            if (paths_painted.length == 0) {
                $('#btn-start-all').removeClass("btn-success").addClass("btn-secondary").attr("disabled",true);
            }
        }
      }, 100);
    };
    wait_for_UEs_data();


    // add listener to the select option for map refresh
    ui_add_select_listener_map_reload();


    // events
    api_get_all_monitoring_events();
    start_events_refresh_interval();
    ui_add_select_listener_events_reload();


    // in case the header-toggle button is pressed,
    // the map container resizes and the map has to invalidateSize()
    $('#mapid').resize(function(){mymap.invalidateSize()});
});

$( window ).resize(function() {
    $('#mapid').css({"height": window.innerHeight * 0.65} );
});
// ===============================================





// ===============================================
//         Interval - map refresh functions
// ===============================================
// 
// Initializes the "UE_refresh_interval"
// which triggers an Ajax call every "UE_refresh_sec"
// to fetch the UE data and update the map
// 
function start_map_refresh_interval() {

    if (UE_refresh_interval == null) {

        if ( UE_refresh_sec == 0 ) {
            $('.map-reload-select').prop("disabled",false);
            return;
        }

        // specify the seconds between every interval
        if ( UE_refresh_sec ==-1 ) { // select is "off" and "disabled"
             UE_refresh_sec = UE_refresh_sec_default;
        }

        // start updating
        UE_refresh_interval = setInterval(function(){ 
            api_get_UEs_from_memory();
        }, UE_refresh_sec);

        // enable the select button
        $('.map-reload-select').prop("disabled",false);
        $('.map-reload-select').val(UE_refresh_sec);
    }
}


function stop_map_refresh_interval() {
    // stop updating every second
    clearInterval( UE_refresh_interval );
    UE_refresh_interval = null;
    
    // disable the select button
    $('.map-reload-select').prop("disabled",true);
    // UE_refresh_sec = 0;
    // $('.map-reload-select').val(0);
}


function reload_map_refresh_interval( new_option ) {
    
    stop_map_refresh_interval();
    UE_refresh_sec  = new_option;

    if (new_option==0) {
        // user has choosed 0 / off
        // and wants to stop fetcing UEs...
        return;
    } else {
        start_map_refresh_interval();
    }
}
// ===============================================








// ===============================================
//         Interval - event refresh functions
// ===============================================
// 
// Initializes the "events_refresh_interval"
// which triggers an Ajax call every "events_refresh_sec"
// to fetch the event data and update datatable
// 
function start_events_refresh_interval() {

    if (events_refresh_interval == null) {

        // start updating
        events_refresh_interval = setInterval(function(){ 
            api_get_last_monitoring_events();
        }, events_refresh_sec);

        $('.events-reload-select').val(events_refresh_sec);
    }
}


function stop_events_refresh_interval() {
    // stop updating every second
    clearInterval( events_refresh_interval );
    events_refresh_interval = null;
    
    events_refresh_sec = 0;
    $('.events-reload-select').val(0);
}


function reload_events_refresh_interval( new_option ) {
    stop_events_refresh_interval();
    events_refresh_sec  = new_option;

    if (new_option==0) {
        // user has choosed 0 / off
        // and wants to stop fetcing new events...
        return;
    } else {
        start_events_refresh_interval();
    }
}
// ===============================================







// ===============================================
//         initialize the Leaflet.js map 
// ===============================================
// 
function ui_initialize_map() {

    // set map height
    $('#mapid').css({"height": window.innerHeight * 0.65} );

    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9',    tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23}),
        streets     = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23});


    // map initialization
    mymap = L.map('mapid', {
        layers: [grayscale, cells_lg, cell_coverage_lg, ues_lg, paths_lg]
    }).setView([48.499998, 23.383331], 5);    // Geographical midpoint of Europe
    //.setView([37.996349, 23.819861], 17);  // previous "hard-coded" center for the first map scenario at NCSRD


    var baseLayers = {
            "Grayscale": grayscale,
            "Streets": streets
        };

    var overlays = {
        "cells": cells_lg,
        "cell coverage": cell_coverage_lg,
        "UEs": ues_lg,
        "paths": paths_lg
    };

    L.control.layers(baseLayers, overlays).addTo(mymap);
}






// Ajax request to get UEs data
// on success: paint the UE marks on the map
// 
function api_get_UEs() {
    
    var url = app.api_url + '/UEs?skip=0&limit=1000';

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
            ues = data;
            ui_map_paint_UEs();
        },
        error: function(err)
        {
            console.log(err);
        },
        complete: function()
        {
            // 
        },
        timeout: 60000
    });
}



// Ajax request to get UEs data
// on success: paint the UE marks on the map
// 
function api_get_UEs_from_memory() {
    
    var url = app.api_url + '/utils/state-ues';

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
            ues_memory = data;
            ues = [];
            for(var key in ues_memory) {
               ues.push(ues_memory[key]);
            }
            ui_map_paint_UEs();
        },
        error: function(err)
        {
            console.log(err);
        },
        complete: function()
        {
            // 
        },
        timeout: 60000
    });
}



// 1. At first Ajax call, UE marks are generated and painted on the map
// 2. At later Ajax calls, the marks are just updated (coordinates and popup content)
// 
function ui_map_paint_UEs() {

    console.log(ues);

    for (const ue of ues) {
        if (UEs_first_paint) { 
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
            
            ue_markers[ue.supi] = L.marker([ue.latitude,ue.longitude], {icon: walk_icon}).addTo(mymap)
                .bindTooltip(ue.ip_address_v4)
                .bindPopup("<b>"+ ue.name +"</b><br />"+
                           // ue.description +"<br />"+
                           "location: ["  + ue.latitude.toFixed(6) + "," + ue.longitude.toFixed(6) +"]<br />"+
                           "Cell ID: " + ( (ue.cell_id_hex==null)? "-" : ue.cell_id_hex ) +"<br />"+
                           "External identifier: " + ue.external_identifier +"<br />"+
                           "Speed:"+ ue.speed)
                .addTo(ues_lg); // add to layer group

            if ( ue.cell_id_hex==null ) {
                L.DomUtil.addClass(ue_markers[ue.supi]._icon, 'null-cell');
            } else {
                L.DomUtil.removeClass(ue_markers[ue.supi]._icon, 'null-cell');
            }

        }
        else {
            // move existing markers
            var newLatLng = [ue.latitude,ue.longitude];
            ue_markers[ue.supi].setLatLng(newLatLng);
            ue_markers[ue.supi].setPopupContent("<b>"+ ue.name +"</b><br />"+
                           // ue.description +"<br />"+
                           "location: ["  + ue.latitude.toFixed(6) + "," + ue.longitude.toFixed(6) +"]<br />"+
                           "Cell ID: " + ( (ue.cell_id_hex==null)? "-" : ue.cell_id_hex ) +"<br />"+
                           "External identifier: " + ue.external_identifier +"<br />"+
                           "Speed:"+ ue.speed);


            // update UE marker color
            temp_icon = L.DomUtil.get(ue_markers[ue.supi]._icon);

            if (temp_icon == null) {
                // if the user has unchecked the UEs checkbox ✅ on the map settings
                // temp_icon is null and triggers console errors
                // if this is the case, continue...
                continue;
            } else {
                if ( ue.cell_id_hex==null ) {
                    // 'null-cell' class gives a grey color
                    // to UEs that are not connected to a cell
                    L.DomUtil.addClass(temp_icon, 'null-cell');
                } else {
                    L.DomUtil.removeClass(temp_icon, 'null-cell');
                }
            }
        }
    }
    UEs_first_paint = false;   
}





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
            // 
        },
        success: function(data)
        {
            // console.log(data);
            cells = data;
            ui_map_paint_Cells();
        },
        error: function(err)
        {
            console.log(err);
        },
        complete: function()
        {
            // 
        },
        timeout: 60000
    });
}




// Ajax request to get Cells data
// on success: paint the Cell marks on the map
// 
function ui_map_paint_Cells() {

    for (const cell of cells) {
        // create markers
        var cell_icon_5g = L.divIcon({
            className: 'emu-pin-box',
            iconSize: L.point(30,42),
            iconAnchor: L.point(15,42),
            popupAnchor: L.point(0,-38),
            tooltipAnchor: L.point(0,0),
            html: '<div class="pin-bg pin-bg-red"></div>\
                   <div class="pin-icon icon ion-md-cellular"></div>\
                   <div class="pin-text">5G</div>',
        });
        
        cell_markers[cell.cell_id] = L.marker([cell.latitude,cell.longitude], {icon: cell_icon_5g}).addTo(mymap)
            .bindTooltip(cell.cell_id)
            .bindPopup("<b>"+ cell.name +"</b><br />"+ 
                           cell.description  +"<br />"+
                           "location: ["  + cell.latitude.toFixed(6) + "," + cell.longitude.toFixed(6) +"]<br />"+
                           "radius: "  + cell.radius
                )
            .addTo(cells_lg); // add to layer group        
        
        L.circle([cell.latitude,cell.longitude], cell.radius, {
            color: 'none',
            fillColor: '#f03',
            fillOpacity: 0.05
        }).addTo(cell_coverage_lg).addTo(mymap);
        
        // keep (lat, long) to later set view of the map
        map_bounds.push([cell.latitude,cell.longitude]);
    }
    
    // if cells where found, map -> set view
    if ( cells.length >0 ) {
        var leaflet_bounds = new L.LatLngBounds(map_bounds);
        mymap.fitBounds( leaflet_bounds );
    }

}





// Ajax request to get specific Path data
// on success: paint the Path on the map
// 
function api_get_specific_path( id ) {
    
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
            ui_map_paint_path(data);
        },
        error: function(err)
        {
            console.log(err);
        },
        complete: function()
        {
            // 
        },
        timeout: 60000
    });
}



// Adds a path polyline to the map
// Calls a helper function "fix_points_format()"
// to prepare the data for leaflet.js format
// 
function ui_map_paint_path( data ) {

    var latlng   = fix_points_format( data.points );
    var polyline = L.polyline(latlng, {
        color: data.color,
        opacity: 0.2
    }).addTo(paths_lg).addTo(mymap);
}



// Helper function
// Takes the data fetched from the API
// and returns them with a format appropriate
// leaflet.js
// 
function fix_points_format( datapoints ) {

    // from (array of objects): [{latitude: 37.996095, longitude: 23.818562},{...}]
    // to   (array of arrays) : [[37.996095,23.818562],[...]

    var fixed = new Array(datapoints.length);
    
    for (i=0 ; i<datapoints.length ; i++) {
        fixed[i] = [datapoints[i].latitude , datapoints[i].longitude];
    }
    return fixed;
}





// Ajax request to START the loop for a UE
// on success: handle the state of the buttons
// 
function api_start_loop( ue ) {

    var url = app.api_url + '/utils/start-loop';
    var data = {
        "supi": ue.supi
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
            $("#btn-ue-"+ue.id).data("running",true);
            $("#btn-ue-"+ue.id).removeClass('btn-success').addClass('btn-danger');
            looping_UEs++;

            if (looping_UEs == ues.length) {
                $('#btn-start-all').removeClass('btn-success').addClass('btn-danger');
                $('#btn-start-all').text("Stop all");
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
        timeout: 60000
    });
}



// Ajax request to STOP the loop for a UE
// on success: handle the state of the buttons
// and check whether the interval/updating-the-map has to stop
// 
function api_stop_loop( ue ) {

    var url = app.api_url + '/utils/stop-loop';
    var data = {
        "supi": ue.supi
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
            $("#btn-ue-"+ue.id).data("running",false);
            $("#btn-ue-"+ue.id).addClass('btn-success').removeClass('btn-danger');
            looping_UEs--;

            if (looping_UEs == 0) {
                $('#btn-start-all').addClass('btn-success').removeClass('btn-danger');
                $('#btn-start-all').text("Start all");
                stop_map_refresh_interval();
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
        timeout: 60000
    });
}





// Add start/stop loop button for UE
// It generates HTML based on the button template
// and adds it to the ue-btn-area
// 
function ui_generate_loop_btn_for( ue ) {
    var html_str = ue_btn_tpl.replaceAll("{{id}}", ue.id).replace("{{name}}",ue.name).replace("{{supi}}",ue.supi);
    $(".ue-btn-area").append(html_str);
}





// Set status for the start/stop loop button for specific UE
// It fetches the UE "running" status (true/false)
// and adds the appropriate class.
// It also updates the start-all/stop-all button in case all the UEs are moving
// 
function ui_set_loop_btn_status_for(ue) {
    var url = app.api_url + '/utils/state-loop/' + ue.supi;

    $.ajax({
        type: 'GET',
        url:  url,
        contentType : 'application/json',
        headers: {
            "authorization": "Bearer " + app.auth_obj.access_token
        },
        // data:         JSON.stringify(data),
        processData:  false,
        beforeSend: function() {
            // 
        },
        success: function(data)
        {
            // console.log(data);
            if ( data.running ) {
                $('#btn-ue-'+ue.id).removeClass('btn-success').addClass('btn-danger');
                $('#btn-ue-'+ue.id).data("running",data.running);
                
                looping_UEs++;
                if (looping_UEs == ues.length) {
                    $('#btn-start-all').removeClass('btn-success').addClass('btn-danger');
                    $('#btn-start-all').text("Stop all");
                }
                
                start_map_refresh_interval();
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
        timeout: 60000
    });
}




// Adds a listener to every start/stop loop UE button
// 
function ui_add_ue_btn_listeners(){
    $('.btn-ue').on('click', function(){

        curr_supi = $(this).data("supi");
        
        if ( $(this).data("running") == false) {
            
            // start location UE loop
            api_start_loop({"supi":curr_supi});
            start_map_refresh_interval();

            $(this).data("running",true);
            $(this).removeClass('btn-success').addClass('btn-danger');
        } else {

            // stop location UE loop
            api_stop_loop({"supi":curr_supi});

            $(this).data("running",false);
            $(this).addClass('btn-success').removeClass('btn-danger');
        }
    });
}




// Adds a listener to start/stop ALL button
// 
function ui_add_ue_all_btn_listener() {
    $('#btn-start-all').on('click', function(){
        $(this).toggleClass('btn-success').toggleClass('btn-danger');
        if ( $(this).text() == "Start all" ) {
            
            // start location UE loops
            for (const ue of ues) {
                api_start_loop(ue);
            }

            start_map_refresh_interval();

            $(this).text("Stop all");
        } else {

            // stop location UE loops
            for (const ue of ues) {
                api_stop_loop(ue);
            }

            stop_map_refresh_interval();

            $(this).text("Start all");
        }
    });
}


// Adds a listener to the select button (top right)
// to handle the reload interval for the map.
// On change, it takes the selected value (seconds)
// and reloads the interval
// 
function ui_add_select_listener_map_reload(){
    $('.map-reload-select').on('change', function(){
        reload_map_refresh_interval( $(this).val() );
    });
}



// Adds a listener to the select button (top right)
// to handle the reload interval for the events.
// On change, it takes the selected value (seconds)
// and reloads the interval
// 
function ui_add_select_listener_events_reload(){
    $('.events-reload-select').on('change', function(){
        reload_events_refresh_interval( $(this).val() );
    });
}





// ===============================================
//     How fetching events from the API works:
// ===============================================
//   - every event has a unique number / ID
//   - the backend keeps on-the-fly a dictionary with the 100 latest events.
//     (this way the frontend will be able after a page reload to show the latest 100 events)
//   - on "page load/reload" the frontend asks the above list of events
//   - on "polling for new events" the frontend provides the number / ID of the latest event that has already received to the backend
//     the backend sends back the new events that may have been occurred.
// 
// Example: the frontend provides that it has received up to event 154
//          the backend sends back events 155, 156 and 157 which have taken place in the meanwhile (time between two polling requests)




// Ajax request to get all monitoring events data
// 
// 
function api_get_all_monitoring_events() {
    
    var url = app.api_url + '/utils/monitoring/notifications?skip=0&limit=100';

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
            events = data;
            if ( events_first_fetch ) {
                // initialize datatable
                ui_init_datatable_events();
                events_first_fetch = false;
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
        timeout: 60000
    });
}





// Ajax request to get latest monitoring events data (if any)
// 'latest_event_id_fetched' is used to inform the backend that
// it should respond with newer events if they exist.
// On success they are pushed to the 'events' table and the function
// that appends them to Datatables is called.
// 
function api_get_last_monitoring_events() {
    
    var url = app.api_url + '/utils/monitoring/last_notifications?id=' + latest_event_id_fetched;

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
            events.push(...data);
            ui_append_datatable_events(data);
            
        },
        error: function(err)
        {
            console.log(err);
        },
        complete: function()
        {
            // 
        },
        timeout: 60000
    });
}



// Called to create the Datatable instance of the events.
// 
function ui_init_datatable_events() {
    events_datatbl = $('#dt-events').DataTable( {
        data: events,
        responsive: true,
        paging: false,
        searching: true,
        info: false,
        order: [[5, 'desc']],
        pageLength: -1,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
        columnDefs: [
            {
                "targets": 0,
                "data": "id",
                "visible": true,
                "orderable" : true,
                "searchable": true,
            },
            // {
            //     "targets": 1,
            //     "data": null,
            //     "visible": true,
            //     "orderable": true,
            //     "searchable": true,
            //     "render": function ( data, type, row ) {
            //         details = helper_get_event_details( row.id );

            //         if (details.request_body != null) {
            //             return JSON.parse(details.request_body).monitoringType;
            //         } else {
            //             return "-";
            //         }
            //     }
            // },
            {
                "targets": 6,
                "data": null,
                "defaultContent": '',
                "orderable" : false,
                "searchable": false,
                "render": function ( data, type, row ) {
                    // return row.id;
                    return detail_btn_tpl.replaceAll("{{id}}", row.id);
                },
            },
        ],
        columns: [
            { "data": "id", className: "dt-center" },
            { "data": "serviceAPI" },
            { "data": "isNotification",
              "render": function(data) {
                if (data) {
                    return 'Notification';
                }
                return 'Request';
              }
            },
            { "data": "method", className: "dt-center" },
            { "data": "status_code", className: "dt-center" },
            { "data": "timestamp", className: "dt-center" },
            { "data": null, className: "dt-center" },
        ],
        oLanguage: {
           "sSearch": "quick search: "
         }
    } );


    $('#dt-filter-input').keyup(function(){
        events_datatbl.search($(this).val()).draw() ;
    })
    // $('#dt-filter-input').on('keyup change', function () {
    //     console.log( this.value );
    //     events_datatbl.search(this.value).draw();
    // });

    // update id value of latest event
    if (events.length > 0) { latest_event_id_fetched = events[ events.length-1 ].id }
}



// called after fetching new events and uses the
// Datatables API to add data as new "rows".
// 
function ui_append_datatable_events(data) {

    if (data.length == 0) return;

    for (const event of data) {

        // console.log(event);

        events_datatbl.rows.add( [{
            id:             event.id,
            serviceAPI:     event.serviceAPI,
            isNotification: event.isNotification,
            method:         event.method,
            status_code:    event.status_code,
            timestamp:      event.timestamp,
        }] ).draw( false );
    }

    // update id value of latest event
    latest_event_id_fetched = data[ data.length-1 ].id
}





function show_details_modal( event_id ) {

    details = helper_get_event_details( event_id );

    // load event details
    $("#modal_srv").html( details.serviceAPI );
    $("#modal_endpoint").html(details.endpoint);
    $("#modal_type").html( (details.isNotification)? "Notification" : "Request" );
    $("#modal_code").html(details.status_code);
    $("#modal_method").html(details.method);
    $("#modal_tstamp").html(details.timestamp);

    if (details.request_body != null) {
        $("#modal_req").html(  JSON.stringify( JSON.parse(details.request_body),  null, 4 ) );
    } else {
        $("#modal_req").html(  "empty" );
    }
    
    $("#modal_resp").html( JSON.stringify( JSON.parse(details.response_body), null, 4 ) );

    modal.show();
}


function helper_get_event_details( event_id ) {
    for (const event of events) {
        if (event.id == event_id) return event;
    }
}



function helper_check_path_is_already_painted( path_id ) {
    for (const item of paths_painted) {
        if ( item == path_id ) {
            return true
        }
    }
    return false;
}