function onXScaleChangedWeather() {
    var select = d3.select('#xScaleSelectWeather').node();
    chartScalesWeather.x = select.options[select.selectedIndex].value;
    updateChartData(current_year);
}

function onYScaleChangedWeather() {
    var select = d3.select('#yScaleSelectWeather').node();
    chartScalesWeather.y = select.options[select.selectedIndex].value;
    updateChartData(current_year);
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

var current_year = "all";

d3.csv('cleaned_trackingall_withweather.csv', dataPreprocessor).then(function(dataset) {
    tracking = dataset;
    specific_tracking = dataset;
    empty_tracking = {
        "gameId": null,
        "nflId": null,
        "playerName": null,
        "speed": null,
        "Temperature": null
    };
    console.log(empty_tracking);

    xScaleWeather = d3.scaleLinear()
        .range([0, chartWeatherWidth]);
    yScaleWeather = d3.scaleLinear()
        .range([chartWeatherHeight, 0]);
    
    domainMapWeather = {};

    dataset.columns.forEach(function(column) {
        domainMapWeather[column] = d3.extent(dataset, function(data_element) {
            return data_element[column];
        });
    });
    // Create global object called chartScales to keep state
    chartScalesWeather = {x: "Temperature", y: "speed"};
});

function updateChartData(year) {
    current_year = year;

    if (year === "all") {
        specific_tracking = tracking;
    } else if (year === "2018") {
        specific_tracking = tracking.filter(row_data => row_data["gameId"].startsWith("2018"));
    } else if (year === "2019") {
        specific_tracking = tracking.filter(row_data => row_data["gameId"].startsWith("2019"));
    } else if (year === "2020") {
        specific_tracking = tracking.filter(row_data => (row_data["gameId"].startsWith("2020") || row_data["gameId"].startsWith("2021")));
    } else {
        specific_tracking = tracking;
        console.log("Error at year");
        console.log(year);
    }

    var playerIdWeather = "All";
    var playerIdInputWeather = document.getElementById("PlayerId-field").value;
    if (playerIdInputWeather) {
        playerIdWeather = playerIdInputWeather;
    }
    if (playerIdWeather === "All") {
        console.log("All dot for some year:");
        console.log(year);
    } else {
        if (isNaN(parseInt(playerId))) {
            specific_tracking = specific_tracking.filter(row_data => row_data["playerName"] === playerIdWeather);
        } else {
            specific_tracking = specific_tracking.filter(row_data => row_data["nflId"] === playerIdWeather);
        }
    }
    console.log(specific_tracking);

    yScaleWeather.domain(domainMapWeather[chartScalesWeather.y]).nice();
    xScaleWeather.domain(domainMapWeather[chartScalesWeather.x]).nice();

    xAxisWeatherG.transition()
        .duration(750)
        .call(d3.axisBottom(xScaleWeather));
    yAxisWeatherG.transition()
        .duration(750)
        .call(d3.axisLeft(yScaleWeather));
    
    var dotsWeather = chartWeatherG.selectAll('.dot').data(specific_tracking);
    var dotsWeatherEnter = dotsWeather.enter()
        .append('g')
        .attr('class', 'dot');
    
    dotsWeatherEnter.append('circle')
        .attr('r', 5)
        .style('fill', function(d) {
            dotColor = '#2381b3';
            // assume pre-process is nice
            if (d.gameId.startsWith("2018")) {
                dotColor = '#2361b3';
            } else if (d.gameId.startsWith("2019")) {
                // console.log("2019!!!");
                dotColor = '#2381b3';
            } else {
                dotColor = '#23a1b3';
            }
            // console.log(d.gameId);
            return dotColor;
        })
        .style('opacity', 0.8);

    dotsWeatherEnter.append('text')
        .attr('y', -10)
        .style('font-size', '20px')
        .text(function(d) {
            // console.log(d.gameId);
            return "GameId: "+d.gameId;
        });
    
    dotsWeather.exit().remove();

    dotsWeather.merge(dotsWeatherEnter)
    // .append('circle')
    // .attr('r', 5)
    // .style('fill', function(d) {
    //     dotColor = '#2381b3';
    //     // assume pre-process is nice
    //     if (d.gameId.startsWith("2018")) {
    //         dotColor = '#2361b3';
    //     } else if (d.gameId.startsWith("2019")) {
    //         // console.log("2019!!!");
    //         dotColor = '#2381b3';
    //     } else {
    //         dotColor = '#23a1b3';
    //     }
    //     // console.log(d.gameId);
    //     return dotColor;
    // })
    // .style('opacity', 0.8)
        .transition()
        .duration(750)
        .attr('transform', function(d) {
            var tx = xScaleWeather(d[chartScalesWeather.x]);
            var ty = yScaleWeather(d[chartScalesWeather.y]);
            var msg = 'translate('+[tx, ty]+')';
            console.log("2019!!!");
            return msg;
            // return 'translate('+[tx, ty]+')';
        });
    
    // dotsWeather.exit().remove();
}