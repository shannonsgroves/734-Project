// Find tracking plays
// var file_name = "tracking2018_playId_35.csv"
var file_name = "trackingfull.csv"

gamesToPlays = {};
d3.csv(file_name).then(function(dataset) {
    trackingData = dataset;
    trackingData.forEach(function(value, index) {
        var gameId = value["gameId"];
        var playId = Number(value["playId"]);
        if (!(gameId in gamesToPlays)) {
            var current = [];
            current.push(playId);
        } else {
            var current = gamesToPlays[gameId];
            if (!(current.includes(playId))) {
                current.push(playId);
            }
        }
        gamesToPlays[gameId] = current;
    });
});
    // update way to recieve play
    // var playId = 35;
    // var gameId = 2018121603;
    // var year = 2018;
    // currentPlay = loadPlay(year, gameId, playId);


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

function update_type(type) {
    if (curr_state['type'].includes(type)) {
        curr_state['type'] = curr_state['type'].filter(function(e) { return e !== type })
    } else {
        curr_state['type'].push(type)
    }

    updateChart();
}

function update_result(result) {
    if (curr_state['result'].includes(result)) {
        curr_state['result'] = curr_state['result'].filter(function(e) { return e !== result })
    } else {
        curr_state['result'].push(result)
    }

    updateChart();
}

function dataPreprocessor(row) {
    return {
        'gameId': row['gameId'],
        'playId': row['playId'],
        'specialTeamsPlayType': row['specialTeamsPlayType'].toLowerCase(),
        'specialTeamsResult': row['specialTeamsResult'].toLowerCase(),
        'playDescription': row['playDescription'].toLowerCase(),
        'possessionTeam': row['possessionTeam'],
        'quarter': row['quarter'],
        'gameClock': row['gameClock']
    };
}

d3.select('#plays_container').append('div').append('g')
    .append('text')
    .text('Game ID' + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + 'Play ID' + '\xa0\xa0\xa0\xa0\xa0' + 'Team Name' + '\xa0\xa0\xa0\xa0\xa0' + 'Quarter' + '\xa0\xa0\xa0\xa0\xa0' + 'Time'+ '\xa0\xa0\xa0\xa0\xa0' + 'Play Type')
    .attr('x', -100)
    .attr('y', 0);

var container = d3.select('#plays_container').append('div').attr('id', 'container').attr('width', 600);
var curr_state = {
    'year': [],
    'event': [],
    'type': [],
    'result': [],
    'team': 'ALL'
}

// var viewbox = container.append('svg')
//     .attr('viewBox', '0,0,600,2000');

d3.csv('plays.csv', dataPreprocessor).then(function(dataset) {
    plays_data = dataset;
    updateChart()
});

function updateChart() {
    // viewbox.selectAll('g')
    //     .remove();
    // viewbox.selectAll('rect')
    //     .remove();

    console.log(curr_state);
    if (curr_state['year'].length != 0) {
        var filtered_plays = plays_data.filter(function(d){
            return curr_state['year'].some(el => d.gameId.substring(0,4) == el);
        });
    } else {
        filtered_plays = plays_data
    }

    if (curr_state['event'].length != 0) {
        console.log(filtered_plays);
        var filtered_plays = filtered_plays.filter(function(d){
            return curr_state['event'].some(el => d.playDescription.includes(el));
        });
    } else {
        filtered_plays = filtered_plays
    }

    if (curr_state['type'].length != 0) {
        var filtered_plays = filtered_plays.filter(function(d){
            return curr_state['type'].some(el => d.specialTeamsPlayType.includes(el));
        });
    } else {
        filtered_plays = filtered_plays
    }

    if (curr_state['result'].length != 0) {
        var filtered_plays = filtered_plays.filter(function(d){
            return curr_state['result'].some(el => d.specialTeamsResult.includes(el));
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

    var filtered_plays = filtered_plays.filter(function(d){
        if ((d.gameId in gamesToPlays)) {
            var current = gamesToPlays[d.gameId];
            if ((current.includes(Number(d.playId)))) {
                return true;
            };
        };
        return false;
    });

    
    filtered_plays = filtered_plays.slice(0, 100)

    rect_height = filtered_plays.length * 20
    
    // viewbox.append('rect')
    //     .attr('width', 1000)
    //     .attr('height', rect_height)
    //     .attr('fill', 'white')
    //     .attr('x', 0)
    //     .attr('y', 0);

    // var group = viewbox.append('g')
    //     .attr('x', 0)
    //     .attr('y', 0);
    
    // var texts = group.selectAll('g')
    //     .data(filtered_plays)
    //     .enter();

    // var texts = texts.append('text')
    //     .attr('x', 250)
    //     .attr('y', function (d, i) { return i * 2 * 20 })
    //     .attr('fill', function(d, i) {
    //         // TODO make red if we want
    //         var color = 'black';
    //         if ((d.gameId in gamesToPlays)) {
    //             var current = gamesToPlays[d.gameId];
    //             if ((current.includes(Number(d.playId)))) {
    //                 color = 'black';
    //             };
    //         };
    //         return color;
    //     })
    //     .attr('text-align','start')
    //     .style('pointer-events', 'auto')
    //     .on("click", function (d, i) {
    //         uploadPlayToField(d.playId, d.gameId);})
    //     .text(function (d, i) { 
    //         return d.gameId + '\xa0\xa0\xa0\xa0\xa0' + d.playId + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + d.possessionTeam + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + d.quarter + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + d.gameClock + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + d.specialTeamsPlayType
    //     });

     
    // viewbox.selectAll('tr').remove();
    d3.selectAll('table').remove();
    var table = container.append('table').attr('id', 'play-table');
    var thead = table.append('thead');
    var tr = thead.append('tr');
    tr.append('td').text('\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0').style('text-align','center');
    tr.append('td').text('\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0').style('text-align','center');
    tr.append('td').text('\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0').style('text-align','center');
    tr.append('td').text('\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0').style('text-align','center');
    tr.append('td').text('\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0').style('text-align','center');
    tr.append('td').text('\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0').style('text-align','center');

    var playTableBody = table.append('tbody');

    // var playTableBody = d3.select('#play-table tbody');


    var trPlayer = playTableBody.selectAll('tr')
        .data(filtered_plays)
        .enter()
        .append('tr');

    trPlayer.append('td').style('text-align','center')
        .text(function(play){
            return play['gameId'];
        });
    trPlayer.append('td').style('text-align','center')
        .text(function(play){
            return play['playId'];
        });
    trPlayer.append('td').style('text-align','center')
        .text(function(play){
            return play['possessionTeam'];
        });
    trPlayer.append('td').style('text-align','center')
        .text(function(play){
            return play['quarter'];
        });
    trPlayer.append('td').style('text-align','center')
        .text(function(play){
            return play['gameClock'];
        });
    trPlayer.append('td').style('text-align','center')
        .text(function(play){
            return play['specialTeamsPlayType'];
        });
    trPlayer.on("click", function (d, i) {
            uploadPlayToField(d.playId, d.gameId);})
}

//////////////////Field data (task 3)

// tracking

// Get layout parameters
var svg_f = d3.select('#field');
var svg_fWidth = +svg_f.attr('width');
var svg_fHeight = +svg_f.attr('height');

field = svg_f.append("image")
    .attr("xlink:href", "Field.png")
    .attr('width', svg_fWidth)
    .attr('height', svg_fHeight);
    // .attr('transform', 'translate(0,-0)')

playText = "";
playTextBox = d3.select('#playinfo');
playTextBox.text(playText)
    .attr('fill', 'black');

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

currentTime = 1

// slider
slider = d3.select('slider');

slider = document.getElementById("myRange");
slider.oninput = function() {
    currentTime = this.value;
    updateField(currentTime);
    isClicked = false;
    animate();
};

isClicked = false;
numFrames = -1;

function onRunPlay() {
    console.log(isClicked);
    console.log(currentTime);
    console.log(numFrames);
    isClicked = !isClicked;
    animate();
};

function animate() {
    var interval = window.setInterval(() => {
        if ((!isClicked) || (currentTime >= numFrames)) {
            clearInterval(interval);
        } else {
            // TODO terminate at end of play
            updateField(currentTime);
            currentTime++;
            slider.value = currentTime;
        }
    }, 100);
};

function uploadPlayToField(playId, gameId) {
    var year = 2018;
    currentPlay = loadPlay(year, gameId, playId);
    currentTime = 1;
    slider.value = 1;
    isClicked = false;
    updateField(currentTime);
    console.log(currentTime);
    console.log(numFrames);
    return currentPlay;
}

function loadPlay(year, gameId, playId) {
    numFrames = -1;
    var currentPlay = trackingData.filter(function(d){
        return d["playId"] == playId && d["gameId"] == gameId;
    });
    console.log(currentPlay);
    if (currentPlay.length > 0) {
        numFrames = d3.max(currentPlay, function(d) {
            return Number(d.frameId);
        });        
    }
    playText = "";
    if (numFrames < 0) {
        playText = "PLAY NOT FOUND! Please select a game with red text";// todo
    } else {
        playText = "Game: " + gameId + " play: " + playId;
    };
    playTextBox.text(playText)

    currentTime = 1;
    slider.max = numFrames-1;
    return currentPlay;
};


function updateField(time) {
    // time = times[currentTime];
    var filteredPlayers = currentPlay.filter(function(d){
        return d["frameId"] == time;
    });

    var playerG = svg_f.selectAll('.player')
        .data(filteredPlayers) // Data-bind the planets array to the d3-selection

    var playerGEnter = playerG.enter() // Enter - selects incoming data-bound elements
        .append('g')        
        .attr('class', 'player') // Add the classname that we selected on
        .attr('transform', function(d){
            var x = d.playDirection == "right" ? (padding.l + xScale_f(d['x'])) : fieldWidth - (padding.l + xScale_f(d['x']));
            var y = (padding.t + yScale_f(d['y']));
            return 'translate('+ x + ',' + y + ')';
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