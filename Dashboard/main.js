function update_team() {
    var select = d3.select('#team_name').node();
    curr_state['team'] = select.options[select.selectedIndex].value;

    updateChart();
}

function update_year(year) {
    if (curr_state['year'].includes(year)) {
        curr_state['year'] = curr_state['year'].filter(function(e) { return e !== year })
    } else {
        curr_state['year'].push(year)
    }

    updateChart();
}

function update_event(event) {
    if (curr_state['event'].includes(event)) {
        curr_state['event'] = curr_state['event'].filter(function(e) { return e !== event })
    } else {
        curr_state['event'].push(event)
    }

    updateChart();
}

function dataPreprocessor(row) {
    return {
        'gameId': row['gameId'],
        'playId': row['playId'],
        'playDescription': row['playDescription'].toLowerCase(),
        'possessionTeam': row['possessionTeam'],
        'quarter': row['quarter'],
        'gameClock': row['gameClock']
    };
}

d3.select('#main').append('div').append('g')
    .append('text')
    .text('Game ID' + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + 'Play ID' + '\xa0\xa0\xa0\xa0\xa0' + 'Team Name' + '\xa0\xa0\xa0\xa0\xa0' + 'Quarter' + '\xa0\xa0\xa0\xa0\xa0' + 'Time')
    .attr('x', -100)
    .attr('y', 0);

var container = d3.select('#block_container').append('div').attr('id', 'container').attr('width', 600);
var curr_state = {
    'year': [],
    'event': [],
    'team': 'ALL'
}

var viewbox = container.append('svg')
    .attr('viewBox', '0,0,600,2000');

d3.csv('plays.csv', dataPreprocessor).then(function(dataset) {
    plays_data = dataset;
    updateChart()
});

function updateChart() {
    viewbox.selectAll('g')
        .remove()
    viewbox.selectAll('rect')
        .remove()

    if (curr_state['year'].length != 0) {
        var filtered_plays = plays_data.filter(function(d){
            return curr_state['year'].some(el => d.gameId.substring(0,4) == el);
        });
    } else {
        filtered_plays = plays_data
    }

    if (curr_state['event'].length != 0) {
        var filtered_plays = filtered_plays.filter(function(d){
            return curr_state['event'].some(el => d.playDescription.includes(el));
        });
    } else {
        filtered_plays = filtered_plays
    }

    if (curr_state['team'] == 'ALL') {
        filtered_plays = filtered_plays
    } else {
        var filtered_plays = filtered_plays.filter(function(d){
            return d.possessionTeam == curr_state['team'];
        });
    }
    
    filtered_plays = filtered_plays.slice(0, 100)

    rect_height = filtered_plays.length * 20
    
    viewbox.append('rect')
        .attr('width', 600)
        .attr('height', rect_height)
        .attr('fill', 'white')
        .attr('x', 0)
        .attr('y', 0);

    var group = viewbox.append('g')
        .attr('x', 0)
        .attr('y', 0);
    
    var texts = group.selectAll('g')
        .data(filtered_plays)
        .enter();

    var texts = texts.append('text')
        .attr('x', 250)
        .attr('y', function (d, i) { return i * 2 * 20 })
        .attr('fill', 'black')
        .style('pointer-events', 'auto')
        .on("click", function (d, i) {
            uploadPlayToField(d.playId, d.gameId);})
        .text(function (d, i) { return d.gameId + '\xa0\xa0\xa0\xa0\xa0' + d.playId + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + d.possessionTeam + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + d.quarter + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + d.gameClock});
}

//////////////////Field data (task 3)

// tracking
var file_name = "tracking2018_playId_35.csv"

// Get layout parameters
var svg_f = d3.select('#field');
var svg_fWidth = +svg_f.attr('width');
var svg_fHeight = +svg_f.attr('height');

field = svg_f.append("image")
    .attr("xlink:href", "Field.png")
    .attr('width', svg_fWidth)
    .attr('height', svg_fHeight);
    // .attr('transform', 'translate(0,-0)')

var padding = {t: 0, r: 0, b: 0, l: 0};
// var padding = {t: 50, r: 50, b: 50, l: 50};

var fieldWidth = svg_fWidth - padding.l - padding.r;
var fieldHeight = svg_fHeight - padding.t - padding.b;

xScale_f = d3.scaleLinear()
    .domain([0, 120])
    .range([0, fieldWidth]);

yScale_f = d3.scaleLinear()
    .domain([0, 53.3])
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
times = [];

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
    var playID = 35;
    var gameID = 2018121603;
    currentPlay = loadPlay(gameID, playID);
});

function uploadPlayToField(playID, gameID) {
    console.log(playID + " " + gameID);
    currentPlay = loadPlay(gameID, playID);
    updateField(times[currentTime]);
    return currentPlay
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

    var playerG = svg_f.selectAll('.player')
        .data(filteredPlayers) // Data-bind the planets array to the d3-selection

    var playerGEnter = playerG.enter() // Enter - selects incoming data-bound elements
        .append('g')        
        .attr('class', 'player') // Add the classname that we selected on
        .attr('transform', function(d){
            return 'translate('+ (padding.l + xScale_f(d['x'])) + ',' + (padding.t + yScale_f(d['y'])) + ')';
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
            return 'translate('+ (padding.l + xScale_f(d['x'])) + ',' + (padding.t + yScale_f(d['y'])) + ')';
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