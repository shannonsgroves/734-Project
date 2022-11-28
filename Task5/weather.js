// Global functions called when select elements changed
function onXScaleChanged() {
    var select = d3.select('#xScaleSelect').node();
    // Get current value of select element, save to global chartScales
    chartScales.x = select.options[select.selectedIndex].value
    // Update chart
    updateWeatherChart();
}

function onYScaleChanged() {
    var select = d3.select('#yScaleSelect').node();
    // Get current value of select element, save to global chartScales
    chartScales.y = select.options[select.selectedIndex].value
    // Update chart
    updateWeatherChart();
}

function dataPreprocessor(row) {
    return {
        "gameId": row["gameId"],
        "nflId": row["nflId"],
        "playerName": row["playerName"],
        "speed": +row["speed"],
        "Temperature": +row["Temperature"]
    };
}

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 40, r: 40, b: 40, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

// Create groups for the x- and y-axes
var xAxisG = chartG.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate('+[0, chartHeight]+')');
var yAxisG = chartG.append('g')
    .attr('class', 'y axis');

function updateWeatherChart() {
    yScale.domain(domainMap[chartScales.y]).nice();
    xScale.domain(domainMap[chartScales.x]).nice();

    xAxisG.transition()
        .duration(750)
        .call(d3.axisBottom(xScale));
    yAxisG.transition()
        .duration(750)
        .call(d3.axisLeft(yScale));
    
    var dots = chartG.selectAll('.dot').data(specific_tracking);

    var dotsEnter = dots.enter()
        .append('g')
        .attr('class', 'dot');
    
    dotsEnter.append('circle')
        .attr('r', 5);

    dotsEnter.append('text')
        .attr('y', -10)
        .style('font-size', '20px')
        .text(function(d) {
            return "GameId: "+d.gameId;
        });
    
    dots.exit().remove();

    dots.merge(dotsEnter)
        .transition()
        .duration(750)
        .attr('transform', function(d) {
            var tx = xScale(d[chartScales.x]);
            var ty = yScale(d[chartScales.y]);
            return 'translate('+[tx, ty]+')';
        });
}

function updateChartData(year) {
    // **** Draw and Update your chart here ****
    // buggy in this function

    file_path = './cleaned_tracking'+year+'_withweather.csv';
    d3.csv(file_path, dataPreprocessor).then(function(dataset) {
        tracking = dataset;
        specific_tracking = tracking;
    
        xScale = d3.scaleLinear()
            .range([0, chartWidth]);
        yScale = d3.scaleLinear()
            .range([chartHeight, 0]);
        
        domainMap = {};
    
        dataset.columns.forEach(function(column) {
            domainMap[column] = d3.extent(dataset, function(data_element) {
                return data_element[column];
            });
        });
        // Create global object called chartScales to keep state
        chartScales = {x: "Temperature", y: "speed"};
    });
    var playerId = "All";
    var playerIdInput = document.getElementById("PlayerId-field").value;
    console.log(playerIdInput);
    if (playerIdInput) {
        playerId = playerIdInput;
    }
    console.log(playerId);
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