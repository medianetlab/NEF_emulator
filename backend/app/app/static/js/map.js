// varialbles used for raw data,
// as they are fetched from the API
var mymap = null;
var gNBs  = null;
var cells = null;
var ues   = null;
var paths = null;


// variables used for painting / updating the map
// > map layer groups
var cells_lg         = L.layerGroup(),
    cell_coverage_lg = L.layerGroup(),
    ues_lg           = L.layerGroup(),
    paths_lg         = L.layerGroup();
// > markers
var ue_markers   = {};
var cell_markers = {};
// helper var for correct initialization
var UEs_first_paint = true;

var UE_refresh_interval = null;



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
            // get and paint every path per UE
            for (const ue of ues) {
                api_get_specific_path(ue.path_id);
            }
        }
      }, 100);
    };
    wait_for_UEs_data();


    // TODO:
    // replace with a switch / toggle button...
    $('#btn-start').on('click', function(){
        $(this).toggleClass('btn-success').toggleClass('btn-danger');
        if ( $(this).text() == "Start" ) {
            
            // start location UE loops
            for (const ue of ues) {
                api_start_loop(ue.supi);
            }

            // start updating every second
            UE_refresh_interval = setInterval(function(){ 
                api_get_UEs();
            }, 1000);



            $(this).text("Stop");
        } else {

            // stop location UE loops
            for (const ue of ues) {
                api_stop_loop(ue.supi);
            }

            // stop updating every second
            clearInterval( UE_refresh_interval );

            $(this).text("Start");
        }
    });
    

});



function ui_initialize_map() {
    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23}),
        streets     = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23});


    // map initialization
    mymap = L.map('mapid', {
        layers: [grayscale, cells_lg, cell_coverage_lg, ues_lg, paths_lg]
    }).setView([37.996349, 23.819861], 17);

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
            // 
        },
        success: function(data)
        {
            console.log(data);
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
        timeout: 5000
    });
}



function ui_map_paint_UEs() {

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
                           "Cell ID: " + ue.cell_id_hex +"<br />"+
                           "Speed:"+ ue.speed)
                .addTo(ues_lg); // add to layer group

        }
        else {
            // move existing markers
            var newLatLng = [ue.latitude,ue.longitude];
            ue_markers[ue.supi].setLatLng(newLatLng);
            ue_markers[ue.supi].setPopupContent("<b>"+ ue.name +"</b><br />"+
                           // ue.description +"<br />"+
                           "location: ["  + ue.latitude.toFixed(6) + "," + ue.longitude.toFixed(6) +"]<br />"+
                           "Cell ID: " + ue.cell_id_hex +"<br />"+
                           "Speed:"+ ue.speed);
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
            console.log(data);
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
        timeout: 5000
    });
}


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
            .bindPopup("<b>"+ cell.name +"</b><br />"+ cell.description)
            .addTo(cells_lg); // add to layer group        
        
        L.circle([cell.latitude,cell.longitude], cell.radius, {
            color: 'none',
            fillColor: '#f03',
            fillOpacity: 0.05
        }).addTo(cell_coverage_lg).addTo(mymap);
          
    }    
}






function api_get_specific_path( id ) {
    
    var url = app.api_url + '/frontend/location/' + id;

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
            console.log(data);
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
        timeout: 5000
    });
}


function ui_map_paint_path( data ) {

    var latlng   = fix_points_format( data.points );
    var polyline = L.polyline(latlng, {
        color: '#00a3cc',
        opacity: 0.2
    }).addTo(paths_lg).addTo(mymap);
}



function fix_points_format( datapoints ) {

    // from (array of objects): [{latitude: 37.996095, longitude: 23.818562},{...}]
    // to   (array of arrays) : [[37.996095,23.818562],[...]

    var fixed = new Array(datapoints.length);
    
    for (i=0 ; i<datapoints.length ; i++) {
        fixed[i] = [datapoints[i].latitude , datapoints[i].longitude];
    }
    return fixed;
}




function api_start_loop( supi ) {

    var url = app.api_url + '/utils/start-loop';
    var data = {
        "supi": supi
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
            console.log(data);
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



function api_stop_loop( supi ) {

    var url = app.api_url + '/utils/stop-loop';
    var data = {
        "supi": supi
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
            console.log(data);
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
