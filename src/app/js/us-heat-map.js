/*global d3, GRAPHZ, topojson*/
(function () {
    var generate_pallette =  function(){

        var pallete_arr = [
            [255,255,229],
            [247,252,185],
            [217,240,163],
            [173,221,142],
            [120,198,121],
            [65,171,93],
            [35,132,67],
            [0,104,55],
            [0,69,41]
        ]

        // var pallete_arr = [
        // [255,255,204],
        // [255,237,160],
        // [254,217,118],
        // [254,178,76],
        // [253,141,60],
        // [252,78,42],
        // [227,26,28],
        // [189,0,38],
        // [128,0,38]
        // ]
        return pallete_arr

    }
    var color_pallette = generate_pallette()
    var options;
    var defaults = {
        'width': '850',
        'height': '500',
        'scale': 1000
    };
    var getLegends = function (scale) {
        // var legends = [],
        //     red = 0,
        //     green = 255,
        //     blue = 0,
        //     range = (green - 100),
        //     step = Math.ceil(range / scale.length);
        return [];
    };
    var stateNames = {"AL":"alabama","AK":"alaska","AS":"american samoa","AZ":"arizona","AR":"arkansas","CA":"california","CO":"colorado","CT":"connecticut","DE":"delaware","DC":"dist. of columbia","FL":"florida","GA":"georgia","GU":"guam","HI":"hawaii","ID":"idaho","IL":"illinois","IN":"indiana","IA":"iowa","KS":"kansas","KY":"kentucky","LA":"louisiana","ME":"maine","MD":"maryland","MH":"marshall islands","MA":"massachusetts","MI":"michigan","FM":"micronesia","MN":"minnesota","MS":"mississippi","MO":"missouri","MT":"montana","NE":"nebraska","NV":"nevada","NH":"new hampshire","NJ":"new jersey","NM":"new mexico","NY":"new york","NC":"north carolina","ND":"north dakota","MP":"northern marianas","OH":"ohio","OK":"oklahoma","OR":"oregon","PW":"palau","PA":"pennsylvania","PR":"puerto rico","RI":"rhode island","SC":"south carolina","SD":"south dakota","TN":"tennessee","TX":"texas","UT":"utah","VT":"vermont","VA":"virginia","VI":"virgin islands","WA":"washington","WV":"west virginia","WI":"wisconsin","WY":"wyoming"};
    var renderLegends = function (legendContainer, legends, legendOffset) {
        legendContainer.attr('class', 'grpahz-legends');
        for (var i = 0, len = legends.length; i < len; i++) {
            var legendGroup = legendContainer.append('g');
            legendGroup.attr('class', 'grpahz-legend');
            legendGroup.append('rect')
                .attr('x', legendOffset[0])
                .attr('y', legendOffset[1] + i * 20)
                .attr('width', 10)
                .attr('height', 10)
                .style('fill', legends[i].color);
            legendGroup.append('text')
                .attr('x', legendOffset[0] + 20)
                .attr('y', legendOffset[1] + 10 + i * 20)
                .text(legends[i].label);
        }
    };
    var renderData = function (usMapInfo, data, legendOffset) {
        var self = this,
            legends = getLegends(data.scale),
            us = usMapInfo;
        legendOffset = legendOffset || [800, 400];
        self.svg.insert("path", ".graticule")
            .datum(topojson.feature(us, us.objects.land))
            .attr("class", "land")
            .attr("d", self.path);
        self.svg.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr('class', 'state')
            .style('fill', function (state) {
                var stateCode = state.properties.code,
                    value = data.values[stateCode], 
                    scale = data.scale
                return 'rgb('+get_rgb(value, 0, scale.max)+')';
                // return 'rgb(255,'+(255 - Math.ceil(value/scale.max * 255))+',0)';
            })
            .on('mouseover', function(state){
             	var stateCode = state.properties.code,
             		stateName = stateNames[stateCode],
                 	value = data.values[stateCode];
                showStateHoverPopup.call(self, [d3.event.pageX, d3.event.pageY], stateName, value);
            })
            .attr("d", self.path);
        self.svg.on('mouseout', function(){
        	self.popup.style('display', 'none');
        });
        renderLegends(self.svg.append('g'), legends, legendOffset);
    };
    var get_rgb = function(value, min, max){
        if(value == undefined){
            return '0,0,0'
        }
        var ratio = (Math.log(value)/Math.log(max-min))*9
        var index = Math.max(0, Math.floor(ratio)-1)
        if(value==max){
            console.log(color_pallette[index])
        }
        return color_pallette[index].join()
    }

    var showStateHoverPopup = function(at, state, value){
    	var self = this;
    	self.popup
    		.style('left', at[0] + "px")
    		.style('top', at[1] + "px")
    		.selectAll("*").remove();

    	self.popup.html(['<span class="state-code">',
    								state,
    								'</span>',
    								'<span class="state-value">',
    								value,
    								'</span>'].join(''));
        self.popup.style('display', 'block');
    };
    GRAPHZ.USHeatMap = function (containerId, pOptions) {
        options = GRAPHZ.util.extendMap(defaults, pOptions);
        var width = options.width,
            height = options.height,
            projection = d3.geo.albersUsa()
            .scale(options.scale)
            .translate([width / 2, height / 2]);
        this.containerId = containerId;
        this.container = d3.select("#" + containerId).append('div');
        this.container.classed('us-heat-map', true);
        this.path = d3.geo.path().projection(projection);
        this.svg = this.container
		            .append("svg")
		            .attr("width", options.width)
		            .attr("height", height);
        this.popup = this.container
    				.append('div')
    				.classed('us-heat-map-hover', true);
    };
    GRAPHZ.USHeatMap.prototype.render = function (data, legendOffset, callback) {
        var containerId = this.containerId;
        this.svg.selectAll('g').remove();
        var self = this;
        if (!this.usMapInfo) {
            d3.json("data/us.state.map.json", function (error, us) {
                self.usMapInfo = us;
                self.render(data, legendOffset, callback);
            });
        } else {
            renderData.call(this, this.usMapInfo, data, legendOffset);
            if (callback) {
                callback();
            }
        }
    };
})();
