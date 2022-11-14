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

d3.select('#main').append('g')
    .append('text')
    .text('Game ID' + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + 'Play ID' + '\xa0\xa0\xa0\xa0\xa0' + 'Team Name' + '\xa0\xa0\xa0\xa0\xa0' + 'Quarter' + '\xa0\xa0\xa0\xa0\xa0' + 'Time');

var container = d3.select('#main').append('div').attr('id', 'container');;
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
        .attr('x', 0)
        .attr('y', function (d, i) { return i * 2 * 20 })
        .attr('fill', 'black')
        .text(function (d, i) { return d.gameId + '\xa0\xa0\xa0\xa0\xa0' + d.playId + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + d.possessionTeam + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + d.quarter + '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + d.gameClock});
}

function myFunction() {
    alert ("Hello World!");
  }