/* global window*/
var GRAPHZ =  GRAPHZ || {},
    changeDuration = undefined,
    bgColor = ['000000','202020','404040', '606060', '808080','a0a0a0', 'c0c0c0', 'eoeoeo', 'ffffff', 'ffffcc', 'ffff99', 'ffff66','ffff33', 'ffff00', '99ccff', '66b2ff', '004c99', '003366', 'a0a0a0', '808080', '606060', '404040', '202020', '000000'];

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
    GRAPHZ.util.refreshClock = function(value){
        if(value>=0 && value<=12){
            $('.am').addClass('active')
            $('.pm').removeClass('active')
        }else{
            $('.am').removeClass('active')
            $('.pm').addClass('active')
        }
        clock.refreshDisplay(value)

   }

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
          	play = false;
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

        function renderHourlyMap(dataSet, value){
          heatMap.render(dataSet[value - minHr]);
          update_state_list(dataSet[value - minHr].values)
          GRAPHZ.util.refreshClock(value)
          d3.select('#hourly-count-view')[0][0].selectedIndex = value;
          //d3.select('#main-content').style({'background': "url('./data/photo-" + Math.floor(value/3) + '.jpeg' + "') no-repeat", 'background-size': 'cover'}).transition().delay(500);
          // $('.inner').animate({backgroundColor: '#' + bgColor[value]});
       }

        
        d3.select('#play-btn').on('click', function(){
        	if(changeDuration){
        		window.clearInterval(changeDuration);
        		changeDuration = undefined;
        		this.textContent = 'Play';
        	} else{
            this.textContent = 'Stop';
        		changeDuration = window.setInterval(function(){
	            	if(value == maxHr){
	            		value = minHr;
	            	} else {
	            		value++;
	            	}
                renderHourlyMap(dataSetToRender, value);
	            	return play;
	            }, 1000);

        	}
        });

        d3.select('#prev-btn').on('click', function(){
          var currentHour = d3.select('#hourly-count-view')[0][0].selectedIndex;
          if (currentHour == 0) {
            currentHour = 24;
          }

          d3.select('#hourly-count-view')[0][0].selectedIndex == --currentHour;

          renderHourlyMap(dataSetToRender, currentHour);
        });

        d3.select('#next-btn').on('click', function(){
          var currentHour = d3.select('#hourly-count-view')[0][0].selectedIndex;

          if (currentHour == 23) {
            currentHour = -1;
          }
          d3.select('#hourly-count-view')[0][0].selectedIndex == ++currentHour;
          renderHourlyMap(dataSetToRender, currentHour);
        });

        d3.select('#hourly-count-view').on('change', function(){
          renderHourlyMap(dataSetToRender, parseInt(this.options[this.selectedIndex].text));
        })

        if (daily) {
            heatMap.render(aggregate(dataSet));
        } else {
        	dataSetToRender = transform(dataSet);
        	renderSlider(dataSetToRender, minHr, minHr, maxHr);
        }

    };

    $('#toggle-btn').on('click', function(){
        // this code can be written better
        
        if($('#state-data').is(":visible")){
            $('#state-data').hide();
            
            $('#toggle-btn i').removeClass('icon-arrow-right')
            $('#toggle-btn i').addClass('icon-arrow-left')

            $('#content').removeClass('wd-220-diff')
            $('#content').animate({
                width: '100%'
            }, 300 )
        }else{
            $('#toggle-btn i').removeClass('icon-arrow-left')
            $('#toggle-btn i').addClass('icon-arrow-right')

            $('#content').addClass('wd-220-diff', 300)
            $('#state-data').show();
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
        var html = '', total=0;
        for(var i in state_list){ 
            // $('#state-data').append($('<li/>', {    //here appending `<li>`
            //     'data-role': "list-divider"
            // }).append($('<p/>', {    //here appending `<a>` into `<li>`
            //     'class' : "text-primary",
            //     'text': reverse_stateCodeMap[i] +", "+ data[i] + " visits"
            // })));
            var key = state_list[i]
            if( key in data){
                html += '<tr><td style="text-transform: capitalize;">' + reverse_stateCodeMap[key] + '</td><td>' + k_format(data[key]) + ' visits </td></tr>';
                total+= data[key];
            }          
            
        }

        $('#state-data').append('<table><tr><td><b> Total: </b></td>' + '<td><b>' + k_format(total) + '</b></td></tr>' + html + '</html>');
        

        // $('#state-data').listview('refresh');

    }
})(window);
