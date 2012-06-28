(function() {
  var app = {
    
    featuresUrl: "http://onm.voanews.com/html5/demos/jqm/data/features.js",
    areasUrl: "http://onm.voanews.com/html5/demos/jqm/data/areas.js",
    userLocation: [-77.0365, 38.8942], //default to Washington Monument
    locationAware: false,
    mapIsLive: false, //switch to hold whether or not the map has already been initialized
    nearbyDistance: 750, //distance from center point
    nearbyUnitOfMeasure: "meters", //unit of measurement to use with nearbyDistance
    nearbyFeatures: [], //array of features that are "nearby" the current location
    fourSquareClientId: 'AHKV25MZLFJ25TPLFWJA2JJLKU2EDG0ZR1LQBEND3TG02MQ5',
    debug: false,
    
    getGeoJSON:function(url){
	var result = null;
	jQuery.ajax({
	    url: url,
	    type: "POST",
	    dataType: "json",
	    async: false,
	    success: function (data) {
		result = data;
	    }
	});
      return result;
      //TODO retrieve from local storage... else get ajax
            
    }, //getGeoJSON
    
    resizeContentArea:function() {
	var content, contentHeight, footer, header, viewportHeight;
	window.scroll(0, 0);
	header = $(":jqmData(role='header'):visible");
	footer = $(":jqmData(role='footer'):visible");
	content = $(":jqmData(role='content'):visible");
	viewportHeight = $(window).height();
	//if the address bar in Safari can we add 60px to the content height?
	//if(document.height < viewportHeight){
          //document.body.style.height = (window.outerHeight + 50) + 'px';
	//}
	contentHeight = viewportHeight - header.outerHeight() - footer.outerHeight();
	$("article:jqmData(role='content')").first().height(contentHeight);
	return $("#map_canvas").height(contentHeight);
    }, //resizeContentArea
    
    initLocation:function(){
      if (navigator.geolocation) {
	  navigator.geolocation.getCurrentPosition(
	    function success(position){
	      app.userLocation[0] = position.coords.longitude;
	      app.userLocation[1] = position.coords.latitude;
	      app.locationAware = true;
	    },
	    function fail(error){
	      //alert(error.code);
	      app.locationAware = false;
	    });
      } else {
	app.locationAware = false;
      }
    }, //initUserLocation
    
    updateNearbyCount: function(){
      //var numNearbyItems = jQuery("#nearby-list li").length;
      var numNearbyItems = app.nearbyFeatures.length;
      if(numNearbyItems > 0){
	jQuery('li.nearby-tab span.ui-li-count').text(numNearbyItems);
	jQuery('li.nearby-tab span.ui-li-count').show();
      } else {
	jQuery('li.nearby-tab span.ui-li-count').hide();
      }
    }, //updateNearbyCount
    
    map:{},
    
    initMap:function(){
	      centerLocation = new window.L.LatLng(app.userLocation[1], app.userLocation[0]);
	      map = new window.L.Map('map_canvas', {center: centerLocation, maxZoom: 18, Attribution: ''});

	      //hack to fix sizing issue with JQM
	      //from: http://groups.google.com/group/leaflet-js/browse_thread/thread/2959ba3af68e537a/013871eb67644c72
	      setTimeout(function() {
		  map.invalidateSize();
	      },100);

	      //attach to app
	      app.map = map;
	      
	      //custom tiles
    	      var tileUrl = 'http://api.tiles.mapbox.com/v3/ericpugh.map-njhhx6z3.jsonp';
	      wax.tilejson(tileUrl, function(tilejson) {
		  map.addLayer(new wax.leaf.connector(tilejson));
	      });
	      
	      //custom user icon (blue dot)
	      var UserIcon = window.L.Icon.extend({
		  iconUrl: 'images/blue-dot.png',
		  shadowUrl: null,
		  iconSize: new L.Point(50, 50),
		  iconAnchor: new L.Point(25, 25),
		  popupAnchor: new L.Point(0, -25)
	      });
		
	      
	      //set the inital user location marker
	      var userIcon = new UserIcon();
	      var initialLatLng;
	      if(app.userLocation){
		var initalLng = app.userLocation[0];
		var initalLat = app.userLocation[1];
		initialLatLng = new window.L.LatLng(initalLng, initalLat);
	      } else {
		var initialLatLng = new window.L.LatLng(38.88765, -77.01666);
	      }
	      
	      var userMarker = new window.L.Marker(initialLatLng, {icon: userIcon});
	      map.addLayer(userMarker);
	      
	      var userCircle = new window.L.Circle(initialLatLng, 24);
	      map.addLayer(userCircle);
	      
	      //
	      //watch user's location
	      //
	      map.locate({
		  watch: true,
		  setView: true,
		  maxZoom: 18,
		  maximumAge: 2000,
		  enableHighAccuracy:true
	      });
	      
	  //record map state
	  app.mapIsLive = true;
	      
	  //get the map markers
	  app.placeMarkers(app.map);
	  
	  //
	  //MAP EVENTS
	  //
	  map.on('locationfound', onLocationFound);
	  
	  function onLocationFound(e) {
	    //save currrent location
	    if(e.latlng){
	      app.userLocation[0] = e.latlng.lng;
	      app.userLocation[1] = e.latlng.lat;
	      point = new Point(e.latlng.lat, e.latlng.lng);
	      app.saveUserLocation(point);
	      console.log("userLocation updated: " + e.latlng.lng + " was set to " + app.userLocation[0] + " and " + e.latlng.lat + " was set to " + app.userLocation[1]);
	    }

	    var radius = e.accuracy / 2;
	    userMarker.setLatLng(e.latlng);
	    userCircle.setLatLng(e.latlng);  
	    userCircle.setRadius(radius);
	    console.log("map zoom is " + app.getMapZoom(app.map) + ", radius: " + radius);
      
	  } //onlocationfound
	      
	  map.on('locationerror', onLocationError);
	    function onLocationError(e) {
	      console.log(e.message);
	  } //onlocationError



    }, //initMap
    
    updateUserPosition:function(map){
      map.locate({setView: true, maxZoom: app.getMapZoom(map)});
      
    }, //updateUserLocaton
    
    getMapZoom:function(map){
      //return either the current map zoom level or the default
      var zoom = app.map.getZoom();
      if(zoom && zoom < 17){
	return zoom;
      } else {
	return 17;
      }
	return zoom;
    }, //getMapZoom

    refreshMapPage:function(){
      $.mobile.changePage($("#map-page"), "none", true, false);
    }, //refreshMapPage
        
    refreshDetailPage:function(data){
      //TODO would it be better to load a dynamic php page so we can display more complex content????
      // Get the detail page
      var page = jQuery('#detail-page');

      //update the detail page with given detail data
      var header = page.children(":jqmData(role=header)");
      header.find("h1").html(data.title);
      var content = page.children(":jqmData(role=content)");
      var markup = "<p>" + data.description + "</p><p>Feature number: " + data.id + "</p>";
      content.html(markup);
      
      $.mobile.changePage($("#detail-page"), { transition : 'slide', reverse : true });
    }, //refresDetailPage
    
    placeMarkers:function(map){
	var mapMarkers = [];
	var featureCollection = app.getGeoJSON(app.featuresUrl);

	//TODO validate json or error
	
	jQuery.each(featureCollection, function(index, value) {
	  //each record in geojson
	    if ( value && typeof value === 'object' ) {
	      jQuery.each(value, function(index, value){
		//for each object, we're just looking for "Point" types
		if ( value.geometry.type == 'Point' 
		  && value.geometry.coordinates[0] !== 'undefined' 
		  && value.geometry.coordinates[0] !== null ) {
		    //create leaflet LatLng from the coordinates array (notice the params are reversed)
		    var mapMarkerLocation = new L.LatLng(value.geometry.coordinates[1],value.geometry.coordinates[0]);
		    var mapMarkerOptions = {}; //optional
		    var mapMarker = new L.Marker(mapMarkerLocation, mapMarkerOptions);
		    //featureInfo is not part of Leaflet. We're attaching it 
		    //to the marker obj as a new property so it can used later, in the click handler. 
		    mapMarker.featureInfo = value;
		    mapMarker.on('click', function(e) { 
		      //the marker clickhandler
		      //get detail data
		      data = app.getFeatureDetail(e.target.featureInfo);
		      //load detail page with data
		      app.refreshDetailPage(data);
		    }); 
		    //build the array of markers to be added to the map
		    mapMarkers.push(mapMarker); 
		}
	      });
	    }
	}); 
			
	//
	//add markers to map as a feature group
	//
	if (typeof mapMarkers[0] !== 'undefined' && mapMarkers[0] !== null) {
	  var group = new L.FeatureGroup(mapMarkers); 
	  map.addLayer(group); 
	}

    },//placeMarkers
    
    createFeatureLists:function(){
	//TODO pull this from local storage if available
	
	//create the list page from json featurecollection
	var featureCollection = app.getGeoJSON(app.featuresUrl);
	//TODO validate json or dialog error message
	var placelist = jQuery("#places-list");
	var nearbylist = jQuery("#nearby-list");
	var markup = [];
	//reset the array of nearby items
	app.nearbyFeatures = [];
	var listItems, isNearby, isWithin, locationMessage, messageClass, html;
	  jQuery.each(featureCollection, function(index, value) {
	    //each record in geojson
	      if ( value && typeof value === 'object' ) {
		jQuery.each(value, function(index, value){
		  //for each object, we're just looking for "Point" types (even though we're not checking for valid coords)
		  if ( value.geometry.type == 'Point') {
			var currentPoint = value.geometry.coordinates;
			var currentId = value.properties.id;
			
		    if(!isNaN(parseInt(currentId))){
		      jQuery.each(featureCollection, function(index, value){
			   
			if ( value && typeof value === 'object' ) {
			  jQuery.each(value, function(index, value){
			      if(value.geometry.type == 'Polygon' && currentId === value.properties.id){
				//the original geojson array
				var polyCoords = value.geometry.coordinates;
				//coords converted to an array of Point objs
				var polyCoordsAsPoints = app.geoCoordsToPointsArray(polyCoords);
				
				//the arrays of x and y coords used to see if user is within a polygon
				var latCoords = app.getPolySingleAxisCoords(polyCoords, 1);
				var lngCoords = app.getPolySingleAxisCoords(polyCoords, 0);

				//create a Contour from poly Points and get the center point
				var con = new Contour(polyCoordsAsPoints);
				center = con.centroid();

				//build a new "nearby" polygon 500 meters from the original poly center point
				var returnType = "array";
				topRightPoint = app.getDueCoords(center.lat, center.lng, 45, app.nearbyDistance, app.nearbyUnitOfMeasure, returnType);
				bottomRightPoint = app.getDueCoords(center.lat, center.lng, 135, app.nearbyDistance, app.nearbyUnitOfMeasure, returnType);
				bottomLeftPoint = app.getDueCoords(center.lat, center.lng, 225, app.nearbyDistance, app.nearbyUnitOfMeasure, returnType);
				topLeftPoint = app.getDueCoords(center.lat, center.lng, 315, app.nearbyDistance, app.nearbyUnitOfMeasure, returnType);
				var nearbyPolyCoords = [[topRightPoint, bottomRightPoint, bottomLeftPoint, topLeftPoint]];

				isNearby = app.isPointInPoly(app.userLocation[1], app.userLocation[0], app.getPolySingleAxisCoords(nearbyPolyCoords, 0), app.getPolySingleAxisCoords(nearbyPolyCoords, 1));
				
				isWithin = app.isPointInPoly(app.userLocation[1], app.userLocation[0], latCoords, lngCoords);

				//is the current object already in the "nearby" array?
				//exists = app.nearbyFeaturesContains(value);
				//console.log("the curent item exists? " + exists);
    				if(isWithin === true){
				  locationMessage = "You are here! The secret content has been unlocked!";
				  messageClass = "youarehere";
				  app.nearbyFeatures.push(value);
				} else if(isNearby === true){
				  app.nearbyFeatures.push(value);
				  locationMessage = "You are close to this location. Visit to unlock the secret content.";
				  messageClass = "unlock";
				} else {
				  locationMessage = "Visit this location to unlock the secret content.";
				  messageClass = "";
				}
			       }
			  });
			}
		      });

		    }

		      html = '<li id="' + value.properties.id + '">';
		      html += '<h3>' + value.properties.name + '</h3>';
		      html += '<p>' + value.properties.description + '</p>';
		      html += '<input type="hidden" name="foursquareId" id=' + value.properties.foursquareId + ' />';
		      if(locationMessage && typeof locationMessage != 'undefined'){
			  html += '<p class="' + messageClass + '">' + locationMessage + '</p>';
		      }
		      html += '</li>';
		      markup[index] = html;
		  }
		});
	      }
	  });
	  
      //
      //THE PLACES LIST (built from "markup" array)
      //
      //replace list with new content
      placelist.html(markup.join(''))
      
      //click handler for list items, display list detail
      placelist.delegate('li', 'click', function(e) {
	//get the clicked elem as a string
	li = jQuery(this).get(0).outerHTML;
	var data = app.getFeatureDetail(li);
	  app.refreshDetailPage(data);
      });

      //init or refresh the listview
      if (placelist.hasClass('ui-listview')) {
	  placelist.listview('refresh');
      } else {
	  placelist.trigger('create');
      }
      
      //
      //THE NEARBY LIST (built from app.nearbyFeatures)
      //
      if(app.nearbyFeatures.length > 0){
	  markup = [];
	  jQuery.each(app.nearbyFeatures, function(index, value){
	    var nearbyFeature = app.nearbyFeatures[index];
	    html = '<li id="' + nearbyFeature.properties.id + '">';
	    html += '<h3>' + nearbyFeature.properties.name + '</h3>';
	    html += '<p>' + nearbyFeature.properties.description + '</p>';
	    html += '<input type="hidden" name="foursquareId" id=' + value.properties.foursquareId + ' />';
	    html += '</li>';
	    markup[index] = html;
	  });
	      
	    //replace list with new nearby content
	    nearbylist.html(markup.join(''))
	    
	    //click handler for list items, display list detail
	    nearbylist.delegate('li', 'click', function(e) {
	      //get the clicked elem as a string
	      li = jQuery(this).get(0).outerHTML;
	      var data = app.getFeatureDetail(li);
		app.refreshDetailPage(data);
	    });
    
	    //init or refresh the listview
	    if (nearbylist.hasClass('ui-listview')) {
		nearbylist.listview('refresh');
	    } else {
		nearbylist.trigger('create');
	    }
      }

            
    }, //createFeatureLists
    
    nearbyFeaturesContains:function(obj){
      //does a given feature object already exist in the nearbyFeatures array?
      jQuery.each(app.nearbyFeatures, function(value, index){
	if(value[index].properties.id == obj.properties.id){
	    return true;
	}
      });
      return false;
    },//nearbyFeaturesContains
    
    getFeatureDetail:function(data){
      //build detail given an obj or else an html elem as string
      //TODO retrieve from local storage??
      
      //TODO probably a better way to do this in js
      var detail = {};
      if (typeof data === 'object') {
	//get the detail info from obj
	detail.id = data.properties.id;
	detail.title = data.properties.name;
	detail.description = data.properties.description;
	//foursquare content
	//alert(data.properties.foursquareId);
	if(data.properties.foursquareId){
	  //var foursquare = app.getFourSquareVenue(data.properties.foursquareId);
	  //console.log(foursquare);
	}
      } else if(typeof data === 'string'){
	//get the detail info from <li> markup
	li = jQuery(data);
	detail.id = li.attr("id");
	detail.title = li.children("h3").text();
	detail.description = li.children("p").text();
      }

      return detail;
    },//getFeatureDetial

  getFourSquareVenue: function(venueId){
      var apiUrl = "https://api.foursquare.com/v2/venues/" + venueId;

      /*
      jQuery.getJSON(apiUrl, function(data) {
	//get comments from foursquare venues endpoint (Oauth not required)
	var fourSquareComments = [];
	jQuery.each(data, function(key, val) {
	  fourSquareComments.push('<li id="' + key + '">' + val + '</li>');
	});
      
	//$('<ul/>', {
	  //'class': 'fousquare-comments-list',
	  //html: items.join('')
	//}).appendTo('body');
      });
      return fourSquareComments;
      */
  }, //getFourSquareVenue
  
  getDueCoords:function(lat, lng, bearing, distance, unit, returnType) {
    //Return a point used to draw a bounding box around a given center point based a certain distance from the point
      //for example, to get a 1km box around the point (lat/lng) :
      //topLeftCorner = getDueCoords(lat, lng, 315, 1, "km");
      //topRightCorner = getDueCoords(lat, lng, 45, 1, "km");
      //bottomRightCorner = getDueCoords(lat, lng, 135, 1, "km");
      //bottomLeftCorner = getDueCoords(lat, lng, 225, 1, "km");
    //adopted From:
    //http://www.richardpeacock.com/blog/2011/11/draw-box-around-coordinate-google-maps-based-miles-or-kilometers
    //requires rad2deg() and deg2rad() funcs which I've pasted from php.js
    
    //TODO what's going on here?? "meters" are ALWAYS used
    if (distance == "M") {
      //distance is in miles.
      radius = 3963.1676;
    } else if(distance == "km") {
      // distance is in km.
      radius = 6378.1;
    } else {
      //distance in meters
      radius = 6378100
    }
  
    //	New latitude in degrees.
    var new_latitude = app.rad2deg(Math.asin(Math.sin(app.deg2rad(lat)) * Math.cos(distance / radius) + Math.cos(app.deg2rad(lat)) * Math.sin(distance / radius) * Math.cos(app.deg2rad(bearing))));
    //	New longitude in degrees.
    var new_longitude = app.rad2deg(app.deg2rad(lng) + Math.atan2(Math.sin(app.deg2rad(bearing)) * Math.sin(distance / radius) * Math.cos(app.deg2rad(lat)), Math.cos(distance / radius) - Math.sin(app.deg2rad(lat)) * Math.sin(app.deg2rad(new_latitude))));
    
    //param returnType is the string "array"
    if(returnType == "array"){
      //return array
      return [new_latitude, new_longitude];
    } else {
      //return new point obj
      return new Point(new_latitude,new_longitude);
    }
  },//getDueCoords
  
  deg2rad:function(angle){
    return(angle/180)*Math.PI;
  }, //deg2rad
  
  rad2deg:function(angle){
    return angle*57.29577951308232;
  }, //rad2deg
      
    getPolySingleAxisCoords:function(poly, coord_index){
      //return an array of either the lng or lat coords given a polygon array
      //coord_index param switches the lat/lng order
      //for example geojson is [lng/lat] so we'd use "1" to return the correct Latitude val
      axisCoords = [];
        for (var i = 0; i < poly.length; i++) {
	    points = poly[i];
	    for(var j = 0; j < points.length; j++){
		point = points[j];
	      for(var k = 0; k < point.length; k++){
		  coord = point[k];
		  //y/latitude is the second of the pair in geojson
		  if(k == coord_index){
		    axisCoords.push(coord);
		  }
	      }
	    }
	}
	return axisCoords;
    },//getPolySingleAxisCoords
    
    geoCoordsToPointsArray:function(poly){
      //convert the geometry.coordinates nested array of polygon coordinates returned in the geojson
      //as an array of "point" objects  ie. {"lng":77.999, "lat": 34.245}
      result = [];
      for (var i = 0; i < poly.length; i++) {
	points = poly[i];
	  for(var j = 0; j < points.length; j++){
	    point = points[j];
	    //the new x/y object which will be added to result array
	    var pointObj = new Point;
	    for(var k = 0; k < point.length; k++){
	      //loop through final coords, round to 6 decimal places
	      coord = point[k];
	      if(k == 0){
		pointObj.lng = coord;
	      } else if(k == 1){
		pointObj.lat = coord;
	      }
	    }
	    result.push(pointObj);
	  }
      }
      return result;
    }, //geoCoordsToPointsArray

    isPointInPoly:function(x, y, xp, yp){
    //determine if a given point is within a polygon
     //xp is an array of the Longitude values,
     //yp is an array of the Latitude values,
     //x is the Longitude of the point you are looking for,
     //y is the Latitude of the point you are looking for 
     
    //check if within poly
     var i, j, c = 0, npol = xp.length; 
     
     for (i = 0, j = npol-1; i < npol; j = i++) { 
     	if ((((yp[i] <= y) && (y < yp[j])) || 
     		((yp[j] <= y) && (y < yp[i]))) && 
        	(x < (xp[j] - xp[i]) * (y - yp[i]) / (yp[j] - yp[i]) + xp[i])) { 
      			 c =!c; 
      		} 
     	}
	return c;
    
    },//pointIsWithin

    //
    //Local Storage
    //
    
    loadSettings:function(){
      jQuery('#enable-badges').val(localStorage.allowBadges);
    }, //loadSettings
    
    saveSettings:function() {
	localStorage.allowBadges = jQuery('#enable-badges').val();
    }, //saveSettings             
    
    saveUserLocation:function(point){
      //save Point obj to local storage
      localStorage.setItem('userLocation', JSON.stringify(point));
    }, //saveUserLocation
    
    //
    //Common
    //
    roundNumber:function(num, dec) {
      //given a number and the nubmer of decimal places (ie. 6)
      //return rounded number
      var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
      return result;
    } 
  }; //app

//Area
function Area(id){
    //get large "area" polygon (i.e. Washington DC) given the id of the area
    areas = app.getGeoJSON(app.areasUrl);
    	jQuery.each(areas, function(index, value) {
	  //each record in geojson
	    if (value && typeof value === 'object') {
	      jQuery.each(value, function(index, value){
		if ( value.geometry.type == 'Polygon' 
		  && value.properties.id == id) {
		      //get the coords of the found area
		      this.value = value;
		}
	      });
	    }
	});
  }

//Point
function Point(lat,lng) {
   this.lat=lat;
   this.lng=lng;
}

// Contour object constructor
function Contour(points) {
    this.pts = points || []; // an array of Point objects defining the contour
}

Contour.prototype = {
    area:function() {
       var area=0;
       var pts = this.pts;
       var nPts = pts.length;
       var j=nPts-1;
       var p1;
       var p2;
    
       for (var i=0;i<nPts;j=i++) {
	  p1=pts[i]; p2=pts[j];
	  area+=p1.lat*p2.lng;
	  area-=p1.lng*p2.lat;
       }
       area/=2;
       return area;
    },
    
  centroid:function() {
     var pts = this.pts;
     var nPts = pts.length;
     var lat=0;
     var lng=0;
     var f;
     var j=nPts-1;
     var p1; var p2;
  
     for (var i=0;i<nPts;j=i++) {
	p1=pts[i];
	p2=pts[j];
	f = (p1.lat * p2.lng) - (p2.lat * p1.lng);
	lat += (p1.lat + p2.lat) * f;
	lng += (p1.lng + p2.lng) * f;
     }
     f=this.area()*6;
     return new Point(lat/f,lng/f);
  }
} //Contour

    
   

  
  
  //
  //Jquery Mobile
  //

  window.app = app;
  
  
  //resize content on change
  jQuery(window).bind('orientationchange pageshow resize', window.app.resizeContentArea);
  
  //
  //Handle page changes
  //
  jQuery(document).bind('pagebeforechange', function(e, data) {
    
      if(typeof(data.toPage) !== 'string'){
	  return;
      }
      //adjust content area
      window.app.resizeContentArea();
          
      if(!window.app.mapIsLive){
	window.app.initMap();
      }
      
      //create the "places" and "nearby" lists
      app.createFeatureLists();

      //update the count bubble in nav
      app.updateNearbyCount();

      //get the hashtag target
      var hashParts = $.mobile.path.parseUrl(data.toPage).hash.split('-');
      var index = -1;
      
      if(hashParts.length === 2){
	  index = parseInt(hashParts[1]);
      }
      var options = data.options;
      if(hashParts[0] === "#map"){
	  //manually change to map page to avoid "Map already initialized" errors
	  window.app.refreshMapPage (index, options);
	  e.preventDefault();
      } else if(hashParts[0] === "#detail"){
	  // Display Detail for the selected marker.
	  app.refreshDetailPage(id, options);
	  e.preventDefault();
      }else if(hashParts[0] === "#list"){
	  $.mobile.changePage($("#list-page"), "none", true, false);
	  e.preventDefault();
      }else if(hashParts[0] === "#nearby"){
	  $.mobile.changePage($("#nearby-page"), "none", true, false);
	  e.preventDefault();
      } else {
	  return; // fall back to default behavior
      }
  
  });
  
  //
  //INIT
  //
  jQuery(document).bind('pageinit', function(event) {
	try {
	  app.initLocation();
	  //save settings to localStorage
	  app.saveSettings();
	  
	  //welcome message (only on welcome screen)
	  if(location.href.indexOf("#") == -1){
	    var welcomeMsgContainer = jQuery(".welcome-geo-msg");
	    DC = new Area(1);
	    var polyCoords = DC.geometry.coordinates;
            var latCoords = app.getPolySingleAxisCoords(polyCoords, 1);
            var lngCoords = app.getPolySingleAxisCoords(polyCoords, 0);
            isWithinArea = app.isPointInPoly(app.userLocation[1], app.userLocation[0], latCoords, lngCoords);
	    if(isWithinArea){
	      welcomeMsgContainer.hide();
	    } else {
	      welcomeMsgContainer.html('<p>You are in Washington DC!</p>');
	    }
	  }

	  if(!window.app.mapIsLive){
	    window.app.initMap();
	  }
	  
	  //TODO only display the welcome dialog ONCE after checking if inside one of the "areas"
	  //jQuery.mobile.changePage('#welcome-dialog', 'pop', true, true);
	
	  //update the count bubble in nav
	  app.updateNearbyCount();
	  
	} catch(e) {
	  //TODO Display in dialog
	    console.log(e)
	}
	
    }); //pageinit
  
  jQuery('#map-page').live('pagecreate',function(e){
      
      //handler for the "refresh" btn
      jQuery("#refresh-btn").live('tap',function(e) {
	//click handler for refresh button
	window.app.updateUserPosition(window.app.map);
      });
  });

  
}).call(this);
