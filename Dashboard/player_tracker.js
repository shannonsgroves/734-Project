var file_name = "tracking2018_playId_35.csv"

// Get layout parameters
var svg = d3.select('#field');
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

field = svg.append("image")
    .attr("xlink:href", "Field.png")
    .attr('width', svgWidth)
    .attr('height', svgHeight);

var padding = {t: 30, r: 30, b: 30, l: 30};

var fieldWidth = svgWidth - padding.l - padding.r;
var fieldHeight = svgHeight - padding.t - padding.b;

xScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, fieldWidth]);

yScale = d3.scaleLinear()
    .domain([0, 50])
    .range([0, fieldHeight]);

colorScale = d3.scaleOrdinal(d3['schemeDark2'])
parseDate = d3.timeParse('%b %Y');

currentTime = 0

// slider
slider = d3.select('slider')

slider = document.getElementById("myRange");
slider.oninput = function() {
    currentTime = this.value;
    updateField(times[currentTime]);
    isClicked = false;
    animate();
};

isClicked = false;
function onRunPlay() {
    isClicked = !isClicked;
    animate();
};

function animate() {
    var interval = window.setInterval(() => {
        if (!isClicked || (currentTime >= times.length)) {
            clearInterval(interval);
        } else {
            // TODO terminate at end of play
            updateField(times[currentTime]);
            currentTime++;
            slider.value = currentTime;
        }
    }, 100);
};

d3.csv(file_name).then(function(dataset) {
    trackingData = dataset;
    // update way to recieve play
    // var playID = 35;
    // var gameID = 2018121603;
    // currentPlay = loadPlay(gameID, playID);
});

function uploadPlayToField(playID, gameID) {
    currentPlay = loadPlay(gameID, playID);
    updateField(times[currentTime]);
}

function loadPlay(gameID, playID) {
    times = [];
    var currentPlay = trackingData.filter(function(d){
        return d["playId"] == playID && d["gameId"] == gameID;
    });
    currentPlay.forEach(function(value, index) {
        if (!times.includes(value["time"])) {
            times.push(value["time"]);
        };
    });
    slider.max = times.length-1;
    return currentPlay;
};


function updateField(time) {
    // time = times[currentTime];
    var filteredPlayers = currentPlay.filter(function(d){
        return d["time"] == time;
    });

    var playerG = svg.selectAll('.player')
        .data(filteredPlayers) // Data-bind the planets array to the d3-selection

    var playerGEnter = playerG.enter() // Enter - selects incoming data-bound elements
        .append('g')        
        .attr('class', 'player') // Add the classname that we selected on
        .attr('transform', function(d){
            return 'translate('+xScale(d['x']) + ',' + yScale(d['y']) + ')';
        });

    playerG.append('circle')
        .attr('r', 10)
        .style('fill', function(d){
            // Set the fill color based on the hzd value
            return colorScale(d['team']);

        });

    playerG.merge(playerGEnter)
        .transition()
        .duration(100)
        .attr('transform', function(d) {
            return 'translate('+xScale(d['x']) + ',' + yScale(d['y']) + ')';
        });

    // circle
    playerGEnter.append('circle')
        .attr('r', 10)
        .style('fill', function(d){
            // Set the fill color based on the hzd value
            return colorScale(d['team']);

        });

    // name
    playerGEnter.append('text')
        .attr('class', 'name') // Add the classname that we selected on
        .attr('dy', '-0.7em')
        .text(function(player){
            return player['displayName'];
        });

    // jersey number
    // playerGEnter.append('text')
    //  .attr('class', 'number') // Add the classname that we selected on
    //  .attr('dx', '-0.45em')
    //  .attr('dy', '0.2em')
    //  .text(function(player){
    //      return Math.trunc(player['jerseyNumber']);
    //  });

    playerG.exit().remove();
}