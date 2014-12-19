/* global GRAPHZ*/
(function () {
    var stateCodes = ["AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "GU", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MH", "MA", "MI", "FM", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PW", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "VI", "WA", "WV", "WI", "WY"];

    function random(max) {
        return Math.ceil(Math.random() * max);
    }
    GRAPHZ.USHeatMapDataGenerator = {
        next: function () {
            var data = {
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
            for (var i = 0, len = stateCodes.length; i < len; i++) {
                data.values[stateCodes[i]] = random(1000);
            }
            return data;
        }
    };
})();