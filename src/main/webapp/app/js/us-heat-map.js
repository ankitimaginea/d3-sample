/*global d3, GRAPHZ, topojson*/
(function () {
    var defaults = {
        'width': '960',
        'height': '500',
        'scale': 1000
    };
    var getLegends = function (scale) {
        var legends = [],
            red = 255,
            green = 0,
            blue = 0,
            range = 400,
            step = Math.ceil(range / scale.length);
        for (var i = 0, j = 0; i < range; i += step) {
            if (i <= 255) {
                green = i;
            } else if (i <= 510) {
                red = (510 - i);
            }
            legends.push({
                'range': scale[j].range,
                'label': scale[j].label,
                'color': 'rgb(' + [red, green, blue].join(',') + ')'
            });
            j++;
        }
        return legends;
    };
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
                    scale = data.scale,
                    range = [];
                for (var i = 0, len = scale.length; i < len; i++) {
                    range = scale[i].range;
                    if (value >= range[0] && value <= range[1]) {
                        return legends[i].color;
                    }
                }
                return '#ccc';
            })
            .attr("d", self.path);
        renderLegends(self.svg.append('g'), legends, legendOffset);
    };
    GRAPHZ.USHeatMap = function (containerId, options) {
        options = GRAPHZ.util.extendMap(defaults, options);
        var width = options.width,
            height = options.height,
            projection = d3.geo.albersUsa()
            .scale(options.scale)
            .translate([width / 2, height / 2]);
        this.path = d3.geo.path().projection(projection);
        this.svg = d3.select("#" + containerId)
            .append("svg")
            .attr("width", options.width)
            .attr("height", height);
    };
    GRAPHZ.USHeatMap.prototype.render = function (data, legendOffset, callback) {
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