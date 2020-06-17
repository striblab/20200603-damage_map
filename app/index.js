/**
 * Main JS file for project.
 */

// Define globals that are added through the js.globals in
// the config.json file, here like this:
// /* global _ */

// Utility functions, such as Pym integration, number formatting,
// and device checking

import Popover from './shared/popover.js';
import StribPopup from './shared/popup.js';
import utilsFn from './utils.js';
import buildings from '../sources/buildings_damaged_final.json';
import dots from '../sources/buildings_damaged.json';
import frames from '../sources/mapframes.json';

const utils = utilsFn({});

const popover_thresh = 500; // The width of the map when tooltips turn to popovers
const isMobile = (window.innerWidth <= popover_thresh || document.body.clientWidth) <= popover_thresh || utils.isMobile();
const adaptive_ratio = utils.isMobile() ? 1.1 : 1.3; // Height/width ratio for adaptive map sizing

let popover = new Popover('#map-popover');


var mapframes = frames.frames;

let center = [-93.204818,44.956389];
let name = mapframes[0].name;
let zoom = 12;

$.urlParam = function(name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results != null) {
      return results[1] || 0;
  } else {
      return null;
  }
}

var selected = $.urlParam('map');

if (selected != null) {
    $("#map-legend").show();
    $("#map-legend2").hide();
    center = [mapframes[selected].longitude,mapframes[selected].latitude];;
    name = mapframes[selected].name;
    zoom = mapframes[selected].zoom;
}

$("#nameSpace").html(name);

mapboxgl.accessToken = 'pk.eyJ1Ijoic3RhcnRyaWJ1bmUiLCJhIjoiY2sxYjRnNjdqMGtjOTNjcGY1cHJmZDBoMiJ9.St9lE8qlWR5jIjkPYd3Wqw';

/********** MAKE MAP **********/

// Set adaptive sizing
let mapHeight = window.innerWidth * adaptive_ratio;
document.getElementById("map").style.height = mapHeight.toString() + "px";

const zoomThreshold = 13;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/startribune/ck1b7427307bv1dsaq4f8aa5h',
  center: center,
  zoom: zoom,
  minZoom: 12,
  maxZoom: 16,
  maxBounds: [-97.25, 43.2, -89.53, 49.5],
  scrollZoom: false
});

// $("#mapmain").css('pointer-events','none');

/********** SPECIAL RESET BUTTON **********/
class HomeReset {
  onAdd(map){
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl my-custom-control mapboxgl-ctrl-group';

    const button = this._createButton('mapboxgl-ctrl-icon StateFace monitor_button')
    this.container.appendChild(button);
    return this.container;
  }
  onRemove(){
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
  _createButton(className) {
    const el = window.document.createElement('button')
    el.className = className;
    el.innerHTML = '&#x21BB;';
    el.addEventListener('click',(e)=>{
      e.style.display = 'none'
      console.log(e);
      // e.preventDefault()
      e.stopPropagation()
    },false )
    return el;
  }
}
const toggleControl = new HomeReset();

var scale = new mapboxgl.ScaleControl({
  maxWidth: 80,
  unit: 'imperial'
  });
  map.addControl(scale)

// Setup basic map controls
if (utils.isMobile() || selected != null) {
  map.dragPan.disable();
  map.keyboard.disable();
  map.dragRotate.disable();
  map.touchZoomRotate.disableRotation();
  map.scrollZoom.disable();
  $("#map").css("pointer-events","none");
} 

if (selected == null) {
  $("#nameSpace").html("");
  $("#map-legend").hide();
  $("#map-legend2").show();
  map.getCanvas().style.cursor = 'pointer';
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }),'top-left');
  map.addControl(toggleControl,'top-left');

  $('.my-custom-control').on('click', function(){
    map.jumpTo({
      center: center,
      zoom: 12,
    });
  });
}

var popup;

/********** MAP BEHAVIORS **********/

map.on('load', function() {
  // Prep popup
  let popup = new StribPopup(map);

  // Fastclick-circumventing hack. Awful.
  // https://github.com/mapbox/mapbox-gl-js/issues/2035
  $(map.getCanvas()).addClass('needsclick');

  map.addSource('nb', {
    type: 'geojson',
    data: buildings
  });
 
   map.addLayer({
        'id': 'nb-layer',
        'interactive': true,
        'source': 'nb',
        'minzoom': zoomThreshold,
        'layout': {},
        'type': 'fill',
          'paint': {
            'fill-antialias' : true,
            'fill-opacity': 0.85,
            'fill-outline-color': "#888888",
            'fill-color': "#888888"
          }
    }, 'road-primary');

    map.addSource('dots', {
      type: 'geojson',
      data: dots
    });

    map.addLayer({
      'id': 'fardots',
      'interactive': true,
      'source': 'dots',
      'maxzoom': 13,
      'layout': {},
      'type': 'circle',
       'paint': {
          'circle-opacity': 0.7,
          'circle-radius': 4,
          'circle-stroke-width': 0.1,
          'circle-stroke-color': '#333333',
          'circle-color': '#F2E0C7'
       }
  });

   
    map.addLayer({
      'id': 'dots',
      'interactive': true,
      'source': 'dots',
      'minzoom': zoomThreshold,
      'layout': {},
      'type': 'circle',
       'paint': {
          'circle-opacity': 1,
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#333333',
          'circle-color': [
            'match',
            ['get', 'damage_cat'],
            'Minor property damage',
            '#F2E0C7',
            'Property damage',
            '#F2E0C7',
            'Medium property damage',
            '#F2E0C7',
            'Severe property damage',
            '#F2E0C7',
            'Fire',
            '#C28059',
            'Severe fire damage',
            '#C28059',
            'Destroyed',
            '#9E403C',
            '#ccc'
            ]
       }
  });

  map.on('zoom', function() {
    if (map.getZoom() >= 13) {
      $("#map-legend").show();
      $("#map-legend2").hide();

      map.setPaintProperty(
        'nb-layer',
        'fill-color','#aaaaaa' 
      );

    } else {
      $("#map-legend").hide();
      $("#map-legend2").show();

      map.setPaintProperty(
        'nb-layer',
        'fill-color','#888888' 
      );
    }
  });
  

  popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
    });

  map.on('mouseenter', 'dots', function(e) {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer';
     
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.business_name;
    var address = e.features[0].properties.address;
    var damage = e.features[0].properties.damage_cat;
     
    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
     
    // Populate the popup and set its coordinates
    // based on the feature found.
    popup
    .setLngLat(coordinates)
    .setHTML("<div class='name'>" + description + "</div>" + "<div>" + address + "</div>" + "<div>" + damage + "</div>")
    .addTo(map);
    });
     
    map.on('mouseleave', 'dots', function() {
    map.getCanvas().style.cursor = '';
    popup.remove();
    });

});