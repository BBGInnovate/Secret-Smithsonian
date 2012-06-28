        // map's TileJSON url. Define your map layers here.
        var url = 'http://api.tiles.mapbox.com/v3/ericpugh.map-njhhx6z3.jsonp';
        // Make a new Leaflet map in your container div
        var map = new L.Map('mapbox');	
        map.on('load', function(){ 
			//TODO: show a loading icon, then disable after the map has loaded
            console.log("map loaded");
			console.log("jquery mobile detection: " + jQuery.browser.mobile);
			if(!jQuery.browser.mobile){
				jQuery('#navbar p#message').text("Visit this page on a Tablet or Mobile Device for full functionality");
			}
        });
        map.setView(new L.LatLng(38.8942, -77.0365), getMapZoom());
        
        // Get metadata about the map from MapBox
        wax.tilejson(url, function(tilejson) {
            map.addLayer(new wax.leaf.connector(tilejson));
            
            //output map description in controls
            $(".map-description").html(tilejson.description);
        });
         
        //get the map zoom
        //return either the current map zoom level or the default
        function getMapZoom(){
            var zoom = map.getZoom();
                if(zoom && zoom < 17){
                    return zoom;
                } else {
                    return 17;
                }
            //default
            return zoom;
        }

                
        //create a custom user icon (blue dot)
        var UserIcon = L.Icon.extend({
            iconUrl: 'images/blue-dot.png',
            shadowUrl: null,
            iconSize: new L.Point(50, 50),
            iconAnchor: new L.Point(25, 25),
            popupAnchor: new L.Point(0, -25)
        });
        
        //set the inital user location marker
        var userIcon = new UserIcon();
        var initialLatLng = new L.LatLng(38.88765, -77.01666);
        var userMarker = new L.Marker(initialLatLng, {icon: userIcon});
        map.addLayer(userMarker);
        
        var userCircle = new L.Circle(initialLatLng, 24);
        map.addLayer(userCircle);

         //Cohen Building
        var southWestPoint = new L.LatLng(38.88744,-77.01744),
            northEastPoint = new L.LatLng(38.88743, -77.01544),
            cohenBounds = new L.LatLngBounds(southWestPoint, northEastPoint);
			

        //
        //watch user's location
        //
        map.locate({
            watch: true,
            setView: true,
            maxZoom: getMapZoom(),
	    maximumAge: 2000,
            enableHighAccuracy:true
        });
		map.on('locationfound', onLocationFound);
		map.on('locationerror', onLocationError);

        function onLocationFound(e) {
            var radius = e.accuracy / 2;
            userMarker.setLatLng(e.latlng);
            userCircle.setLatLng(e.latlng);
            userCircle.setRadius(radius);
            console.log("Location update: " + e.latlng + ", radius: " + radius);
            console.log("map zoom is " + getMapZoom());
			//test if current location is withing the Cohen Building bounds
			atWork = cohenBounds.contains(e.latlng);
			console.log("within bounds: " + atWork);
			if(atWork){
				alert("You are inside the Cohen Building Bounds");
			}

        }
        
        map.on('locationerror', onLocationError);
        function onLocationError(e) {
            console.log(e.message);
        }
        
        
        
        //reset the user's location
        function locateUser() {
            map.locate({setView : true});
            console.log('locateUser');
        }        
        

        //buttons
        jQuery(".refresh-btn").click(locateUser);
        jQuery("span.close-btn").click(function() {
	    jQuery('#modal .feature').remove();
	    jQuery('#mapbox').show("slide", { direction: "left" }, 600);
	    jQuery('#modal').hide("slide", { direction: "right" }, 500);
	    showButton("refresh-btn");

	});
	
	//show/hide navbar buttons
        function showButton(classname){
	    jQuery('.btn').hide();
	    jQuery('.' + classname).show();
	}
        
        //
        //add test bounds or polys
        //
        //Create Avalon bounds given the Southwest and Northeast corner
        var southWestPoint = new L.LatLng(38.86115,-77.40062),
            northEastPoint = new L.LatLng(38.85734, -77.39727),
            bounds = new L.LatLngBounds(southWestPoint, northEastPoint);

		/*
			var p1 = new L.LatLng(38.88744, -77.01744),
				p2 = new L.LatLng(38.88743, -77.01544),
				p3 = new L.LatLng(38.88642, -77.01545),
				p4 = new L.LatLng(38.88641, -77.01739);
			var cohenPoly = new L.Polygon([p1,p2,p3,p4]);
			cohenPoly.bindPopup("Broadcasting Board of Governors.");
			map.addLayer(cohenPoly);
		*/
        
  </script>
		
		<script src="museums.js"></script>
		<script type="text/javascript">
		/*
		var museumGeoJsonLayer = new L.GeoJSON(museumGeoJSON, {
		    pointToLayer: function (latlng){
				//return default marker
		        return new L.Marker(latlng, {});
		    }
		});
		
		museumGeoJsonLayer.on('featureparse', function (e) {
			if (e.properties && e.properties.name){
				e.layer.bindPopup(e.properties.name);
				//click handler for geojson markers
				e.layer.on('click', function (e) {
					clicked = e.target;
					console.log(clicked);
				});
			}
		});

		
		museumGeoJsonLayer.addGeoJSON(museumGeoJSON);
		// Add the GeoJSON layer to map
		map.addLayer(museumGeoJsonLayer);
		
*/
		/*
		// Define a GeoJSON data layer with data
		var geojsonLayer = new L.GeoJSON();
		geojsonLayer.on('featureparse', function (e) {
			if (e.properties && e.properties.name){
				//e.layer.bindPopup(e.properties.name);
				//click handler for geojson markers
				e.layer.on('click', function (e) {
					featureInfo = e.target.properties;
					console.log(featureInfo.name);
				});
			}
		});
		*/
		
		var museums = []; 
			//museumData = jQuery.parseJSON(museumGeoJSON);
			//console.log(museumData);
			jQuery.each(museumGeoJSON, function(index, value) { 
				//each museum record in geojson
			    if ( value && typeof value === 'object' ) {
					jQuery.each(value, function(index, value){
						//for each object under the museum, we're looking for "geometry"
						//console.log(value.geometry.coordinates.toString());
						if ( value.geometry.type == 'Point' 
							&& value.geometry.coordinates[0] !== 'undefined' 
							&& value.geometry.coordinates[0] !== null ) {
								//create leaflet LatLng from the coordinates array (notice the params are reversed)
								var museumLocation = new L.LatLng(value.geometry.coordinates[1],value.geometry.coordinates[0]);
								var museumOptions = {}; //optional
								var museum = new L.Marker(museumLocation, museumOptions);
								//featureInfo is not part of Leaflet. We're attaching it 
								//to the marker obj as a new property so it can used later, in the click handler. 
								museum.featureInfo = value;
								museum.on('click', function(e) { 
									//the marker clickhandler
									getFeatureDetail(e.target.featureInfo);
								}); 
								//build the array of museums to be added to the map
								museums.push(museum); 
						}
					});
				}
			}); 
			
			//
			//add museum items to map as a feature group
			//
			if (typeof museums[0] !== 'undefined' && museums[0] !== null) {
				var group = new L.FeatureGroup(museums); 
				map.addLayer(group); 
			}
			
			//
			//Dispaly modal window with clicked feature item content
			//
			function getFeatureDetail(data){
				console.log('clicked feature: ' + data.properties.id + ': ' + data.properties.name);
				//clear the modal content
				jQuery('#modal .feature').remove();
				
				//add content to modal
				var html = '<div class="feature">';
				var html = html + '<h1>' + data.properties.name + '</h1>';
				//TODO replace lipsum text with dynamic content
				var html = html + lipsum;
				var html = html + '</div>';
				//insert content after the controls
				jQuery('#modal').prepend(html);
				jQuery('#modal').show("slide", { direction: "right" }, 600);
				jQuery('#mapbox').hide("slide", { direction: "left" }, 500);
				showButton("close-btn");

			}
