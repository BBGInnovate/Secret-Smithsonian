<!DOCTYPE HTML>
<html class="no-js">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />    
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="format-detection" content="telephone=no">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta http-equiv="cleartype" content="on">
    
    <link rel="apple-touch-icon" sizes="80x80" href="images/icons/DCicon80.png">
    <link rel="apple-touch-icon" href="images/icons/DCicon57.png" sizes="57x57">
    <link rel="apple-touch-icon" href="images/icons/DCicon114.png" sizes="114x114">
    <link rel="apple-touch-icon" href="images/icons/DCicon72.png" sizes="72x72">
    <link rel="apple-touch-icon-precomposed" sizes="android-only" href="images/icons/DCicon57.png">
    
    <title>DC Tour</title>
    
    <link rel="stylesheet" href="http://code.jquery.com/mobile/1.1.0/jquery.mobile-1.1.0.min.css" />
    <link rel="stylesheet" href="http://leaflet.cloudmade.com/dist/leaflet.css">
    
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/css3.css">
    <link rel="stylesheet" href="css/add2home.css">

    
    <!--[if lte IE 8]>
        <link rel="stylesheet" href="http://leaflet.cloudmade.com/dist/leaflet.ie.css" />
    <![endif]-->
    
    <script src="js/modernizr.dev.js"></script>
    <script src="http://code.jquery.com/jquery-1.7.2.min.js"></script>
    <script src="http://code.jquery.com/mobile/1.1.0/jquery.mobile-1.1.0.min.js"></script>
    <!-- plugins -->
    <script src='js/jquery/detectmobilebrowser.js' type='text/javascript'></script>    
    <script src="http://leaflet.cloudmade.com/dist/leaflet.js"></script>
    <script src="wax.leaf.min.js"></script>
    <script src="js/app.js"></script>
    <script src="js/add2home.js" charset="utf-8"></script>

    <!--[if IE]>
        <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js" type="text/javascript"></script>
    <![endif]-->
    
    <!-- "Add to Home Page" Iphone/Ipad message -->
    <script type="text/javascript">
    var addToHomeConfig = {
            touchIcon: true,
            animationIn: 'drop',
            startDelay: 100
    };
    </script>

	
    
</head>

<body>

<!-- Welcome Dialog -->

    <section data-role="page" id="welcome-page">
        <header data-role="header">
            <h1>Welcome to DC</h1>
        </header>
    
        <article data-role="content" id="map-page-welcome">
            <img src="images/logo.png" style="text-align: center;" />
            <div id="welcome-geo-msg">
                <p>You are not in the map area.</p>
                <p>Some of the app's functions will not be available to you.</p>
            </div>
            <a data-role="button" data-icon="arrow-r" data-iconpos="right" data-corners="false" href="#map-page">Continue to the map!</a>
        </article>
    
    </section>

<!-- Map Page -->

    <section data-role="page" id="map-page">
        <header data-role="header">
            <h1>Washington D.C. Map</h1>
            <a data-icon="refresh" class="ui-btn-right" data-iconpos="notext" id="refresh-btn">Refresh</a>
        </header>
    
        <article data-role="content" id="map-page-content" style="padding: 0;">
            <div data-enhance="false" id="map_canvas" style="height: 300px; margin: 0; padding: 0;"></div>
        </article>
    
        <footer data-role="footer" data-position="fixed" data-id="tabs" data-tap-toggle="false">
          <div data-role="navbar" data-iconpos="bottom" >
            <ul>
              <li><a class="ui-btn-active ui-state-persist" href="#map-page" data-icon="home" data-transition="map">Map</a></li>
              <li class="nearby-tab"><a href="#nearby-page" data-icon="grid" data-transition="fade">Nearby</a><span class="ui-li-count"></span></li>
              <li><a href="#list-page" data-icon="grid" data-transition="fade">Places</a></li>
              <li><a href="#settings-page" data-icon="gear" data-transition="fade">Settings</a></li>
              </li>
            </ul>
          </div>
        </footer>
    
    </section>
    


<!-- All Places Page -->

    <section data-role="page" id="list-page">
        <header data-role="header">
            <h1>All Places</h1>
        </header>
    
        <article data-role="content" id="list-page-content">
            <ol data-role="listview" data-theme="c" id="places-list" class="content-list">
                <li>Sorry, there was a problem loading the places</li>
            </ol>
        </article>
        
        <footer data-role="footer" data-position="fixed" id="tabs">
          <div data-role="navbar" data-iconpos="bottom" >
            <ul>
              <li><a href="#map-page" data-icon="home" data-transition="map">Map</a></li>
              <li class="nearby-tab"><a href="#nearby-page" data-icon="grid" data-transition="fade">Nearby</a><span class="ui-li-count"></span></li>
              <li><a class="ui-btn-active ui-state-persist" href="#list-page" data-icon="grid" data-transition="fade">Places</a></li>
              <li><a href="#settings-page" data-icon="gear" data-transition="fade">Settings</a></li>
              </li>
            </ul>
          </div>
        </footer>

    </section>

<!-- Nearby Places Page -->

    <section data-role="page" class="list-page" id="nearby-page">
        <header data-role="header">
            <h1>Nearby Places</h1>
        </header>
    
        <article data-role="content" id="nearby-page-content">
            <ol data-role="listview" data-theme="c" id="nearby-list" class="content-list">
                <li>You are not in the vicinity of an featured places</li>
            </ol>
        </article>
        
        <footer data-role="footer" data-position="fixed" id="tabs">
          <div data-role="navbar" data-iconpos="bottom" >
            <ul>
              <li><a href="#map-page" data-icon="home" data-transition="map">Map</a></li>
              <li class="nearby-tab"><a class="ui-btn-active ui-state-persist" href="#nearby-page" data-icon="grid" data-transition="fade">Nearby</a><span class="ui-li-count" style="display:none;"></span></li>
              <li><a href="#list-page" data-icon="grid" data-transition="fade">Places</a></li>
              <li><a href="#settings-page" data-icon="gear" data-transition="fade">Settings</a></li>
              </li>
            </ul>
          </div>
        </footer>

    </section>

<!-- Settings Page -->
  
    <section data-role="page" id="settings-page" data-direction="reverse">
        <header data-role="header">
            <h1>Settings</h1>
        </header>
    
        <article data-role="content" id="list-page-content">
            <label for="enable-badges">Enable Badge collection:</label>
            <select name="slider" id="enable-badges" data-role="slider">
                    <option value="true">on</option>
                    <option value="false">off</option>
            </select>
            <a href="#badges-page" data-role="button" data-icon="info">View your badges</a>
        </article>
        
        <footer data-role="footer" data-position="fixed" data-id="tabs">
          <div data-role="navbar" data-iconpos="bottom" >
            <ul>
              <li><a href="#map-page" data-icon="home" data-transition="map">Map</a></li>
              <li class="nearby-tab"><a href="#nearby-page" data-icon="grid" data-transition="fade">Nearby</a><span class="ui-li-count"></span></li>
              <li><a href="#list-page" data-icon="grid" data-transition="fade">Places</a></li>
              <li><a class="ui-btn-active ui-state-persist" href="#settings-page" data-icon="gear" data-transition="fade">Settings</a></li>
              </li>
            </ul>
          </div>
        </footer>

    </section>
    
<!-- Badges Page -->
  
    <section data-role="page" id="badges-page" data-theme="c" data-add-back-btn="true" data-direction="reverse">
        <header data-role="header">
            <h1>Badges</h1>
        </header>
    
        <article data-role="content" id="badges-page-content">
                <fieldset class="ui-grid-b badge-grid">
                    <div class="ui-block-a"><div class="ui-bar-b badge"><img src="images/badges/np_0008_African-Art.png" alt="African Art Museum" /></div></div>
                    <div class="ui-block-b"><div class="ui-bar-b badge"><img src="images/badges/np_0009_air_space.png" alt="National Air and Space Museum" /></div></div>	   
                    <div class="ui-block-c"><div class="ui-bar-b badge"><img src="images/badges/np_0006_American-Art-Museum.png" alt="American Art Museum" /></div></div>

                    <div class="ui-block-a"><div class="ui-bar-b badge"><img src="images/badges/np_0013_american-history.png" alt="American History Museum" /></div></div>
                    <div class="ui-block-b"><div class="ui-bar-b badge"><img src="images/badges/np_0010_American-Indian.png" alt="American Indian Museum" /></div></div>	   
                    <div class="ui-block-c"><div class="ui-bar-b badge"><img src="images/badges/np_0000_anacostia-community.png" alt="Anacostia Community Museum" /></div></div>
                    
                    <div class="ui-block-a"><div class="ui-bar-b badge"><img src="images/badges/np_0012_arts-and-industry.png" alt="Arts and Industries Building" /></div></div>
                    <div class="ui-block-b"><div class="ui-bar-b badge"><img src="images/badges/np_0004_Freer-Art-Gallery.png" alt="Freer Gallery of Art" /></div></div>	   
                    <div class="ui-block-c"><div class="ui-bar-b badge"><img src="images/badges/np_0005_Hirschorn-Garden.png" alt="Hirshhorn Museum and Sculpture Garden" /></div></div>
               
                    <div class="ui-block-a"><div class="ui-bar-b badge"><img src="images/badges/np_0003_zoo.png" alt="National Zoo" /></div></div>
                    <div class="ui-block-b"><div class="ui-bar-b badge"><img src="images/badges/np_0014_natural_history.png" alt="Natural History Museum" /></div></div>	   
                    <div class="ui-block-c"><div class="ui-bar-b badge"><img src="images/badges/np_0007_Portrait-Gallery.png" alt="National Portrait Gallery" /></div></div>

                    <div class="ui-block-a"><div class="ui-bar-b badge"><img src="images/badges/np_0001_Postal-Museum.png" alt="Postal Museum" /></div></div>
                    <div class="ui-block-b"><div class="ui-bar-b badge"><img src="images/badges/np_0002_Sackler-Gallery.png" alt="Sackler Gallery" /></div></div>	   
                    <div class="ui-block-c"><div class="ui-bar-b badge"><img src="images/badges/np_0011_castle.png" alt="Smithsonian Castle" /></div></div>

                </fieldset>

        </article>
        
        <footer data-role="footer"></footer>

    </section>

<!-- Detail Page -->

    <section data-role="page" id="detail-page" data-theme="c" data-add-back-btn="true" data-direction="reverse">
        <header data-role="header">
            <h1>Detail Template</h1>
        </header>
    
        <article data-role="content" id="detail-page-content"><p>description template placeholder</p></article>
        
    </section>


</body>
</html>