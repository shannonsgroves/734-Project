// function onXScaleChanged() {
//     var select = d3.select('#xScaleSelect').node();
//     chartScalesWeather.x = select.options[select.selectedIndex].value;
//     updateWeatherChart();
// }

// function onYScaleChanged() {
//     var select = d3.select('#yScaleSelect').node();
//     chartScalesWeather.y = select.options[select.selectedIndex].value;
//     updateWeatherChart();
// }

function dataPreprocessor(row) {
    return {
        "gameId": row["gameId"],
        "nflId": row["nflId"],
        "playerName": row["playerName"],
        "speed": +row["speed"],
        "Temperature": +row["Temperature"]
    };
}

var svgWeather = d3.select('#weather');

// Get layout parameters
var svgWeatherWidth = +svgWeather.attr('width');
var svgWeatherHeight = +svgWeather.attr('height');

var paddingWeather = {t: 40, r: 40, b: 40, l: 40};

// Compute chart dimensions
var chartWeatherWidth = svgWeatherWidth - paddingWeather.l - paddingWeather.r;
var chartWeatherHeight = svgWeatherHeight - paddingWeather.t - paddingWeather.b;

// Create a group element for appending chart elements
var chartWeatherG = svgWeather.append('g')
    .attr('transform', 'translate('+[paddingWeather.l, paddingWeather.t]+')');

// Create groups for the x- and y-axes
var xAxisWeatherG = chartWeatherG.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate('+[0, chartWeatherHeight]+')');
var yAxisWeatherG = chartWeatherG.append('g')
    .attr('class', 'y axis');

function updateWeatherChart() {
    yScale.domain(domainMap[chartScalesWeather.y]).nice();
    xScale.domain(domainMap[chartScalesWeather.x]).nice();

    xAxisWeatherG.transition()
        .duration(750)
        .call(d3.axisBottom(xScale));
    yAxisWeatherG.transition()
        .duration(750)
        .call(d3.axisLeft(yScale));
    
    var dotsWeather = chartWeatherG.selectAll('.dot').data(specific_tracking);

    var dotsWeatherEnter = dotsWeather.enter()
        .append('g')
        .attr('class', 'dot');
    
    dotsWeatherEnter.append('circle')
        .attr('r', 5);

    dotsWeatherEnter.append('text')
        .attr('y', -10)
        .style('font-size', '20px')
        .text(function(d) {
            return "GameId: "+d.gameId;
        });
    
    dotsWeather.exit().remove();

    dotsWeather.merge(dotsWeatherEnter)
        .transition()
        .duration(750)
        .attr('transform', function(d) {
            var tx = xScale(d[chartScalesWeather.x]);
            var ty = yScale(d[chartScalesWeather.y]);
            return 'translate('+[tx, ty]+')';
        });
}

function updateChartData(year) {
    file_path = 'cleaned_tracking'+year+'_withweather.csv';
    d3.csv(file_path, dataPreprocessor).then(function(dataset) {
        tracking = dataset;
        specific_tracking = dataset;
    
        xScale = d3.scaleLinear()
            .range([0, chartWeatherWidth]);
        yScale = d3.scaleLinear()
            .range([chartWeatherHeight, 0]);
        
        domainMap = {};
    
        dataset.columns.forEach(function(column) {
            domainMap[column] = d3.extent(dataset, function(data_element) {
                return data_element[column];
            });
        });
        // Create global object called chartScales to keep state
        chartScalesWeather = {x: "Temperature", y: "speed"};
    });

    var playerId = "All";
    var playerIdInput = document.getElementById("PlayerId-field").value;
    if (playerIdInput) {
        playerId = playerIdInput;
    }
    if (playerId == "All") {
        specific_tracking = tracking;
    } else {
        if (isNaN(parseInt(playerId))) {
            specific_tracking = tracking.filter(row_data => row_data["playerName"] === playerId);
        } else {
            specific_tracking = tracking.filter(row_data => row_data["nflId"] === playerId);
        }
    }
    console.log(specific_tracking);
    updateWeatherChart();
}