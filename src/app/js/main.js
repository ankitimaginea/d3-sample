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
    GRAPHZ.start = function (dataURL, daily) {
        var dataSet = clickData;
    	var proxyDataURL = dataURL;
        var heatMapOptions = {
                'width': '100%',
                'height': '100%'
            },
            heatMap,
            dataGenerator = GRAPHZ.USHeatMapDataGenerator,
            minHr = 0,
            maxHr = 23,
            dataSetToRender,
            value = minHr;
        	play = false,
        	animator = undefined;
        var containerId = "graph-container";
        d3.select("#" + containerId + " div").remove();
        heatMap = new GRAPHZ.USHeatMap('graph-container');

        function renderSlider(dataSet, value){
        	var sliderContainer = d3.select('#slider');
        	var slider = d3.slider().axis(true).value(value).min(minHr).max(maxHr).step(1).on("slide", function (evt, value) {
                heatMap.render(dataSet[value - minHr]);
                update_state_list(dataSet[value - minHr].values)
                value = value;
            });
        	sliderContainer.selectAll("*").remove();
        	sliderContainer.call(slider);
            update_state_list(dataSet[value - minHr].values)
            heatMap.render(dataSet[value - minHr]);
        }

        d3.select('#play-btn').on('click', function(){
        	if(animator){
        		window.clearInterval(animator);
        		animator = undefined;
        		this.innerText = 'Play';
        	} else{
        		animator = window.setInterval(function(){
	            	if(value == maxHr){
	            		value = minHr;
	            	} else {
	            		value++;
	            	}
	            	renderSlider(dataSetToRender, value);
	            	return play;
	            }, 500);
        		this.innerText = 'Stop';
        	}
        });

        if (daily) {
            heatMap.render(aggregate(dataSet));
        } else {
        	dataSetToRender = transform(dataSet);
        	renderSlider(dataSetToRender, minHr, minHr, maxHr);
        }

    };

    $('#toggle-btn').on('click', function(){
        // this code can be written better
        $('#state-data').toggle()
        if($('#state-data').is(":visible")){
            $('#content').animate({
                width: '65.3%'
            }, 300 )
        }else{
            $('#content').animate({
                width: "82.5%"
            }, 300 );
        }
        
    })

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

    function get_reverse_code(data_map){
        var rev_data_map = {}
        var state_list = []
        for(var i in data_map){
            rev_data_map[data_map[i]] = i
            state_list.push(data_map[i])
        }
        return [rev_data_map, state_list]

    }
    var processed_data = get_reverse_code(stateCodeMap)
    var reverse_stateCodeMap = processed_data[0] 
    var state_list = processed_data[1] 

    function aggregate(dataSet) {
        var currMax = 0;
        var transformedDataPoint = {
            "scale":{},
            "values": []
        };

        for(var i = 0; i < dataSet.length; i++){
            var stateName = dataSet[i][2], stateCode, stateTotal;
            if (stateName) {
                stateCode = stateCodeMap[stateName.toLowerCase()];
                stateTotal = transformedDataPoint.values[stateCode];
                stateTotal = ((stateTotal)? stateTotal : 0 ) + dataSet[i][0];
                transformedDataPoint.values[stateCode] = stateTotal;
            }
        }
        for (i in transformedDataPoint.values) {
            currMax = Math.max(currMax, (transformedDataPoint.values[i] || 0));
        }
        transformedDataPoint.scale.max = currMax;
        update_state_list(transformedDataPoint.values)
        return transformedDataPoint;
    }

    function transform(dataSet) {
        var aggTimeLine = [];
        var i = 0;
        var currValue = null;
        var currTime = null;
        for ( ; i < dataSet.length; i++) {
            // extract on basis of 2nd column
            currValue = dataSet[i];
            currTime = parseInt(currValue[1]);
            aggTimeLine[currTime] = aggTimeLine[currTime] || [];
            aggTimeLine[currTime].push([currValue[2], currValue[0]]);
        }
        return transformForTimeLine(aggTimeLine);
    }

    function transformForTimeLine(dataSet){
    	var transformedDataSet = [], currMax = 0, invalidData = [];
    	for(var i = 0, len=dataSet.length; i < len; i++){
    		var dataPoint = dataSet[i];
        	var transformedDataPoint = {
                "scale":{},
                "values": []
                };
        	for(var j = 0, jLen = dataPoint.length; j < jLen; j++) {
                var stateName = dataPoint[j][0];
                // there are null state names, so silently drop them
                if (stateName) {
        		    var stateCode = stateCodeMap[stateName.toLowerCase()];
        		    transformedDataPoint.values[stateCode] = dataPoint[j][1];
                    currMax = Math.max(currMax, dataPoint[j][1]);
                } else {
                    invalidData.push(dataPoint[j]);
                }
        	}
            transformedDataPoint.scale.max = (currMax + 1);
        	transformedDataSet.push(transformedDataPoint);
    	}
    	return transformedDataSet;
    }

    function k_format(number){
        var k_number = parseInt(number)
        k_number = Math.ceil(k_number/1000)
        return k_number + 'k'
    }

    function update_state_list(data){
        $('#state-data').empty()
        // var table = $('#state-data').append($(table))
        var html = '<table>';
        for(var i in state_list){ 
            // $('#state-data').append($('<li/>', {    //here appending `<li>`
            //     'data-role': "list-divider"
            // }).append($('<p/>', {    //here appending `<a>` into `<li>`
            //     'class' : "text-primary",
            //     'text': reverse_stateCodeMap[i] +", "+ data[i] + " visits"
            // })));
            var key = state_list[i]
            if( key in data){
                html += '<tr><td>' + reverse_stateCodeMap[key] + '</td><td>' + k_format(data[key]) + ' visits </td></tr>';
            }
            
        }

        $('#state-data').append(html)
        

        // $('#state-data').listview('refresh');

    }
})(window);
