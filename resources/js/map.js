/*Initialize Map*/
var map = L.map('map').setView([34.54, -94.28], 4);



/*Create Base Map Layer*/
var osm = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  maxZoom: 15,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
}).addTo(map);

var osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
});



/*Get WMS Layer*/
var WMSLayer1 = L.Geoserver.wms('http://20.64.145.134:8080/geoserver/it.geosolutions/wms', {
  layers: 'it.geosolutions:CrudeOilPipelines',
});



/*Function to Get Overlays From GeoServers Layers*/
var getWFSLayer = (layerName, styleObject = null, onEachFeatureFunction = null) => {
    //var serverAndPort = 'localhost:8080';
    var serverAndPort = '20.64.145.134:8080';  

    var layerNamePrefix = layerName.split(':')[0];
    var urlRoot = `http://${serverAndPort}/geoserver/${layerNamePrefix}/ows`;

    var defaultParameters = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: `${layerName}`,
        maxFeatures: '50',
        outputFormat: 'application/json',
        //format_options: 'callback:getJson',
        //SrsName : 'EPSG:4326'
    };

    var parameters = L.Util.extend(defaultParameters);
    var url = urlRoot + L.Util.getParamString(parameters);

    var WFSLayer = L.geoJson(null, {
        style: function (feature) {
            return styleObject;
        },
        pointToLayer: null,
        filter: null,
        onEachFeature: onEachFeatureFunction,
    });

    $.ajax({
        url: url,
        dataType: 'json',
        //dataType: 'jsonp',
        //jsonCallback: 'getJson',
        success: function(response) {
            console.log('success');
            console.log(response);
            console.log(response.features);
            WFSLayer.addData(response);
            //WFSLayer.addTo(map);
        },
        error: function(e){
            console.log('failure');
            console.log(e);
        }
    });

    return WFSLayer;
};



/*Get WFS Layer and Add to Map*/
//var WFSLayer1 = getWFSLayer('ne:countries');  //able to get this layer when using "var serverAndPort = 'localhost:8080';" in getWFSLayer() function
var WFSLayer1 = getWFSLayer('it.geosolutions:CrudeOilPipelines');
WFSLayer1.addTo(map)



/*L.Control.panelLayers*/
var baseLayers = [
	{
		active: true,
		name: 'OpenStreetMap',
		layer: osm,
	},
    {
		name: 'OpenStreetMap.HOT',
		layer: osmHOT,
	},
];

var overLayers = [
    {
        group: 'WMS Test Layers',
        collapsed: false,
        layers: [
            {
                name: 'Oil Pipeline WMS',
                layer: WMSLayer1,
            },
        ],
    },
    {
        group: 'WFS Test Layers',
        collapsed: false,
        layers: [
            {
                name: 'Oil Pipeline WFS',
                layer: WFSLayer1,
            }, 
        ],
    },
];



map.addControl(new L.Control.PanelLayers(baseLayers, overLayers, {
    //compact: false,
    //collapsed: false,
    //autoZIndex: true,
    collapsibleGroups: true,
    //groupCheckboxes: false,
    selectorGroup: true,
    //buildItem: null,
    title: 'Layer Control',
    className: 'layer-control',
    position: 'topright',
}));
