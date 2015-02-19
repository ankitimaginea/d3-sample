/* global window*/
var GRAPHZ =  GRAPHZ || {},
    changeDuration = undefined,
    bgColor = ['000000','202020','404040', '606060', '808080','a0a0a0', 'c0c0c0', 'eoeoeo', 'ffffff', 'ffffcc', 'ffff99', 'ffff66','ffff33', 'ffff00', '99ccff', '66b2ff', '004c99', '003366', 'a0a0a0', '808080', '606060', '404040', '202020', '000000'];

(function(){

    var minHr = 0;
    var maxHr = 23;
    var dataSetToRender;
    var tick_value = minHr;
    var play = false;

    var isDaily = true;
    var isSortByName = true;

    var heatMapOptions = {
                'width': '100%',
                'height': '100%'
            };
            
    var containerId = "graph-container";
    // d3.select("#" + containerId + " div").remove();
    var heatMap = null

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
        isDaily = daily;

        if(!heatMap){
            heatMap = new GRAPHZ.USHeatMap('graph-container');
        }

        if (daily) {
            dataSetToRender = aggregate(dataSet)
            renderData(dataSetToRender, minHr)
        } else {
        	dataSetToRender = transform(dataSet);
            renderHourlyMap(dataSetToRender, tick_value)
        }

    };

    var createSortByName = function(dataSet){
        var asc = ( $('#totCountLabel1').attr('asc') == 'true');
        var data_to_object_arr = [];
        var comp_list = state_list;
        if(!asc){
            comp_list = rev_state_list;
        }
        for(var i in comp_list){ 
            var key = comp_list[i]
            if( key in dataSet){
                state_name = reverse_stateCodeMap[key]
                value = dataSet[key]
                data_to_object_arr.push({'name': state_name, 'value': value})
            }   
        }
        return data_to_object_arr;
    }

    function countAsc(d1, d2){
        return d2.value - d1.value;
    }
    function countDesc(d1, d2){
        return d1.value - d2.value;
    }

    var createSortByCount = function(dataSet){
        var asc = ($('#hrlCountLabel1').attr('asc') == 'true');
        var data_to_object_arr = createSortByName(dataSet);
        var sort_func = asc ? countAsc: countDesc;
        data_to_object_arr.sort(sort_func);
        return data_to_object_arr;
    }

    var sort_it = function(sorting_func){
        var data_to_object_arr;
        if (isDaily) {
            data_to_object_arr = sorting_func(dataSetToRender.values)
        } else {
            data_to_object_arr = sorting_func(dataSetToRender[tick_value - minHr].values)
        }
        update_state_list(data_to_object_arr);
    }

    GRAPHZ.sort_by_name = function(asc){
        sort_it(createSortByName);
        isSortByName = true;
    };

    GRAPHZ.sort_by_count = function(asc){
        sort_it(createSortByCount);
        isSortByName = false;
    };

    function renderData(dataSet, value){
        var data_to_object_arr;

        if(isSortByName){
            data_to_object_arr = createSortByName(dataSet.values)
        }else{
            data_to_object_arr = createSortByCount(dataSet.values)
        }

        update_state_list(data_to_object_arr)
        heatMap.render(dataSet)
    }

    function renderHourlyMap(dataSet, value){
        heatMap.render(dataSet[value - minHr]);
        var data_to_object_arr;

        if(isSortByName){
            data_to_object_arr = createSortByName(dataSet[value - minHr].values)
        }else{
            data_to_object_arr = createSortByCount(dataSet[value - minHr].values)
        }
        update_state_list(data_to_object_arr);
        $('#hour').text(value + ":00");
        d3.select('#hourly-count-view')[0][0].selectedIndex = value;
   }


    d3.select('#play-btn')
          .attr("title","Play animation")
          .on('click', function(){
            if(changeDuration){
                window.clearInterval(changeDuration);
                changeDuration = undefined;
                $('span', this).addClass("glyphicon-play").removeClass("glyphicon-pause");
            } else{
                $('span', this).addClass("glyphicon-pause").removeClass("glyphicon-play");
                changeDuration = window.setInterval(function(){
                    if(tick_value == maxHr){
                        tick_value = minHr;
                    } else {
                        tick_value++;
                    }
                renderHourlyMap(dataSetToRender, tick_value);
                    return play;
                }, 1000);

            }
        });

    d3.select('#prev-btn').on('click', function(){
      var currentHour = d3.select('#hourly-count-view')[0][0].selectedIndex;
      if (currentHour == 0) {
        currentHour = 24;
      }

      // change the value for time representation
      $('#hour').text(--currentHour + ":00");
      d3.select('#hourly-count-view')[0][0].selectedIndex == currentHour;
      tick_value = currentHour;
      
      renderHourlyMap(dataSetToRender, currentHour);
    });

    d3.select('#next-btn').on('click', function(){
          var currentHour = d3.select('#hourly-count-view')[0][0].selectedIndex;

          if (currentHour == 23) {
            currentHour = -1;
          }
          
          // change the value for time representation
          $('#hour').text(++currentHour + ":00");
          d3.select('#hourly-count-view')[0][0].selectedIndex == currentHour;
          tick_value = currentHour;
          renderHourlyMap(dataSetToRender, currentHour);
        });

        d3.select('#hourly-count-view').on('change', function(){
          renderHourlyMap(dataSetToRender, parseInt(this.options[this.selectedIndex].text));
        })

    //handle the resize of the window
    d3.select(window).on('resize', function () {
                heatMap.resizeMap();
        }
    );


    $('#toggle-btn').on('click', function(){
        // this code can be written better
        
        if($('#state-data').is(":visible")){
            $('#state-data').hide();
            $('#content').animate({
                width: '100%'
            }, 300 )
        }else{
            $('#content').animate({
                width: "80%"
            }, 100 );
        $('#state-data').show(500);
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

    function reverse(a) {
        var result = [];
        var len = a.length;
        while(len){
            len--;
            result.push(a[len]);
        }
        return result;
    }

    var processed_data = get_reverse_code(stateCodeMap);
    var reverse_stateCodeMap = processed_data[0]; 
    var state_list = processed_data[1];
    var rev_state_list = reverse(state_list);

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
        k_number = Math.ceil(k_number/1)
        //return k_number + 'k'
        return k_number.toLocaleString();
    }

    function get_width(d, min, max){
        var width =  ( 1 + (d.value-min)/(max-min)*100 ).toFixed(2) ; 
        return  width + "%";
    }

    function update_state_list(data_to_object_arr){

        var min = d3.min(data_to_object_arr, function(d){return d.value })
        var max = d3.max(data_to_object_arr, function(d){return d.value })
        var total = d3.sum(data_to_object_arr, function(d){return d.value })

        var all_div = d3.select("#state-data").selectAll("div")
        if(all_div[0].length > 1){

            // var progress_bar_div = all_div.selectAll("div").data(data_to_object_arr)

            d3.select("#state-data").selectAll('.progress-bar').data(data_to_object_arr)
            // .attr('class', 'progress-bar text-capitalize')
            .style("width", function(d) { return get_width(d, min, max); })

            d3.select("#state-data").selectAll('.namec').data(data_to_object_arr).text(function(d, i){return i+1 +'. '+ d.name })
            d3.select("#state-data").selectAll('.countc').data(data_to_object_arr).text(function(d,i){return ' '+ k_format(d.value) })

        }else{
            var progress_div = all_div
            .data(data_to_object_arr)
            .enter().append("div").attr('class', 'progress')

            var progress_bar_div = progress_div.append("div").attr('class', 'progress-bar text-capitalize')
            .style("background-color", function(d) { return '#78C679' ; })
            .style("width", function(d) { return get_width(d, min, max); })

            progress_bar_div.append('span').text(function(d, i){return i+1 +'. '+ d.name })
            .attr('class', 'pdl10 namec');
            progress_bar_div.append('span').text(function(d,i){return ' '+ k_format(d.value) })
                .style('margin-left', '5px')
                .attr('class', 'countc');
        }
        
        
        

        
        // // set the total number of visits
        $('#totalVisits').text(total.toLocaleString());

    }
})(window);
