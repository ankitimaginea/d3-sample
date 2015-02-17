/*global d3, GRAPHZ, topojson*/
(function () {
    
    var options;
    var defaults = {
        'width': '850',
        'height': '500',
        'scale': 850
    };

    var color_pallette = [
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

    var get_rgb = function(value, min, max){
        if(value == undefined){
            return '0,0,0'
        }
        var ratio = (Math.log(value)/Math.log(max-min))*9
        var index = Math.max(0, Math.floor(ratio)-1)
        return color_pallette[index].join()
    }

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

    var defs = self.svg.append("defs");

/*
        // for the shadow effect as detailed in the UI proposal (ppt)
        // commented it out for now since this needs special handling in the resize logic.
        // TODO
        defs.append("filter")
          .attr("id", "blur")
          .append("feGaussianBlur")
          .attr("stdDeviation", 5);

        this.svg.append("use")
          .attr("class", "land-glow")
          .attr("xlink:href", "#land");
*/

        defs.insert("path", ".graticule")
            .datum(topojson.feature(us, us.objects.land))
            .attr("id", "land")
            .attr("d", self.path);
        self.svg.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr('class', 'state')
            .attr("d", self.path)
            .style('fill', function (state) {
                var stateCode = state.properties.code,
                    value = data.values[stateCode], 
                    scale = data.scale;
                return 'rgb('+get_rgb(value, 0, scale.max)+')';
            })
            .on('mouseover', function(state){
             	var stateCode = state.properties.code,
             		stateName = stateNames[stateCode],
                 	value = data.values[stateCode];
                showStateHoverPopup.call(self, [d3.event.pageX, d3.event.pageY], stateName, value);
            });
        self.svg.on('mouseout', function(){
        	self.popup.style('display', 'none');
        });
        renderLegends(self.svg.selectAll('g'), legends, legendOffset);
    };

    var reRender = function (usMapInfo, data, legendOffset) {
        var self = this,
            legends = getLegends(data.scale),
            us = usMapInfo;
        legendOffset = legendOffset || [800, 400];
        self.svg.selectAll('path').remove()
        self.svg.insert("path", ".grpahz-legends")
            .datum(topojson.feature(us, us.objects.land))
            .attr("class", "land")
            .attr("d", self.path);
        self.svg.selectAll('g')
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
        renderLegends(self.svg.selectAll('g'), legends, legendOffset);
    };

    var showStateHoverPopup = function(at, state, value){
    	var self = this;
    	self.popup
    		.style('left', at[0] + "px")
    		.style('top', at[1] - 50 + "px")
    		.selectAll("*").remove();
        // TODO - put in a dirty fix to bring the "tooltip" closer to the mouse. Fix later.
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
            .translate([width / 2, height / 2])
            .precision(.1);
        
        this.projection = projection;    
        this.containerId = containerId;
        this.container = d3.select("#" + containerId);
        this.container.classed('us-heat-map', true);
        this.path = d3.geo.path().projection(projection);
        this.svg = this.container
		            .append("svg")
                    .style('width', width + 'px')
                    .style('height', height + 'px')
		            .attr("viewBox", "0 0 ".concat(width, " ", height));
		            //.attr("height", options.height);
        //var viewStr = "0 0 ".concat(width, " ", height);            
        //this.svg.setAttribute("viewBox", "0 0 0 0");
        this.popup = this.container
    				.append('div')
    				.classed('us-heat-map-hover', true);          
    };
    GRAPHZ.USHeatMap.prototype.render = function (data, legendOffset, callback) {
        var containerId = this.containerId;
        var self = this;
        if (!this.usMapInfo) {
            d3.json("data/us.state.map.json", function (error, us) {
                self.usMapInfo = us;
                self.render(data, legendOffset, callback);
            });
        } else {
            if(this.svg.selectAll('g').node()){
                reRender.call(this, this.usMapInfo, data, legendOffset);
            }else{
                this.svg.selectAll('g').remove();
                renderData.call(this, this.usMapInfo, data, legendOffset);
            }
            
            if (callback) {
                callback();
            }
        }
    };
    GRAPHZ.USHeatMap.prototype.resizeMap = function() {
        var map = this.svg;
        var mapRatio = .5;

        // adjust as the window size changes
        var width = parseInt(d3.select('#graph-container').style('width'))
        //var width = parseInt(map.style('width'));
        var height = width * mapRatio;

        // update projection
        this.projection
            .translate([width / 2, height / 2])
            .scale(width);

        // resize the map svg
        map
            .style('width', width + 'px')
            .style('height', height + 'px') 
            .attr("viewBox", "0 0 ".concat(width, " ", height));

        // resize the map
        map.select('.land').attr('d', this.path);
        map.selectAll('.state').attr('d', this.path);

    }
  // -resize of map

})();
