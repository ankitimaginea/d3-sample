/* global window*/
var GRAPHZ =  GRAPHZ || {};
(function(){
    GRAPHZ.util = {};
    GRAPHZ.util.extendMap = function(map1, map2){
        var extendedMap = {};
        for(var key in map1){
            if(map2 && map2[key]){
                extendedMap[key] = map2[key];
            } else {
                extendedMap[key] = map1[key];
            }
        }
        return extendedMap;
    };
    GRAPHZ.start = function (dataURL) {
    	var proxyDataURL = '/proxy?targetUri='+encodeURIComponent(dataURL);
        var heatMapOptions = {
                'width': '100%',
                'height': '100%'
            },
            heatMap = new GRAPHZ.USHeatMap('graph-container'),
            dataGenerator = GRAPHZ.USHeatMapDataGenerator,
            minHr = 8,
            maxHr = 20;
        d3.json(proxyDataURL, function(error, dataSet){
        	dataSet = transform(dataSet);
            var slider = d3.slider().axis(true).min(minHr).max(maxHr).step(1).on("slide", function (evt, value) {
                heatMap.render(dataSet[value - minHr]);
            });
            d3.select('#slider').call(slider);
            heatMap.render(dataSet[0]);
        });
    };
    var stateCodeMap = {"alabama":"AL",
    							"alaska":"AK",
    							"american samoa":"AS",
    							"arizona":"AZ",
    							"arkansas":"AR",
    							"california":"CA",
    							"colorado":"CO",
    							"connecticut":"CT",
    							"delaware":"DE",
    							"dist. of columbia":"DC",
    							"florida":"FL",
    							"georgia":"GA",
    							"guam":"GU",
    							"hawaii":"HI",
    							"idaho":"ID",
    							"illinois":"IL",
    							"indiana":"IN",
    							"iowa":"IA",
    							"kansas":"KS",
    							"kentucky":"KY",
    							"louisiana":"LA",
    							"maine":"ME",
    							"maryland":"MD",
    							"marshall islands":"MH",
    							"massachusetts":"MA",
    							"michigan":"MI",
    							"micronesia":"FM",
    							"minnesota":"MN",
    							"mississippi":"MS",
    							"missouri":"MO",
    							"montana":"MT",
    							"nebraska":"NE",
    							"nevada":"NV",
    							"new hampshire":"NH",
    							"new jersey":"NJ",
    							"new mexico":"NM",
    							"new york":"NY",
    							"north carolina":"NC",
    							"north dakota":"ND",
    							"northern marianas":"MP",
    							"ohio":"OH",
    							"oklahoma":"OK",
    							"oregon":"OR",
    							"palau":"PW",
    							"pennsylvania":"PA",
    							"puerto rico":"PR",
    							"rhode island":"RI",
    							"south carolina":"SC",
    							"south dakota":"SD",
    							"tennessee":"TN",
    							"texas":"TX",
    							"utah":"UT",
    							"vermont":"VT",
    							"virginia":"VA",
    							"virgin islands":"VI",
    							"washington":"WA",
    							"west virginia":"WV",
    							"wisconsin":"WI",
    							"wyoming":"WY"};
    function transform(dataSet){
    	var transformedDataSet = [];
    	for(var i = 0, len=dataSet.length; i < len; i++){
    		var dataPoint = dataSet[i];
        	var transformedDataPoint = {
                    "scale": [{
                            "label": "",
                            "range": [1, 100]
                            }, {
                            "label": "",
                            "range": [100, 200]
                            }, {
                            "label": "",
                            "range": [201, 300]
                            }, {
                            "label": "",
                            "range": [301, 400]
                            }, {
                            "label": "",
                            "range": [401, 500]
                            }, {
                            "label": "",
                            "range": [501, 600]
                            }, {
                            "label": "",
                            "range": [601, 700]
                            }, {
                            "label": "",
                            "range": [701, 800]
                            }, {
                            "label": "",
                            "range": [801, 900]
                            }, {
                            "label": "",
                            "range": [901, 1000]
                            }
                        ],
                    "values": []
                };
        	for(var j =0, jLen = dataPoint.length; j < jLen; j++){
        		var stateCode = stateCodeMap[dataPoint[j][1].toLowerCase()];
        		transformedDataPoint.values[stateCode] = dataPoint[j][0]
        	}
        	transformedDataSet.push(transformedDataPoint);
    	}
    	return transformedDataSet;
    }
})(window);
