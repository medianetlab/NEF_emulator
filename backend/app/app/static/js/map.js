



$( document ).ready(function() {

    var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23}),
        streets  = L.tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr, maxZoom: 23});

    var cells = L.layerGroup(),
        cell_coverage = L.layerGroup(),
        walking_UEs = L.layerGroup(),
        vehicle_UEs = L.layerGroup(),
        routes = L.layerGroup();


    var mymap = L.map('mapid', {
        layers: [grayscale, cells, cell_coverage, walking_UEs, vehicle_UEs, routes]
    }).setView([37.996349, 23.819861], 17);

    var baseLayers = {
            "Grayscale": grayscale,
            "Streets": streets
        };

    var overlays = {
        "cells": cells,
        "cell coverage": cell_coverage,
        "walking UEs": walking_UEs,
        "vehicle UEs": vehicle_UEs,
        "routes": routes
    };

    L.control.layers(baseLayers, overlays).addTo(mymap);
    
});