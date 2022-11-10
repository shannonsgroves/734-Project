var svg = d3.select("svg")
var width = +svg.attr("width")
var height = +svg.attr("height")
var radius = Math.min(width, height) / 2
var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var gamesWithId = new Map()

d3.csv("testData.csv").then(function(data) {
    var filteredData = data.filter(function(row) {
        return row.event !== 'None';
    })

    var groupedGames = d3.group(filteredData, d => d.gameId)
    console.log(groupedGames)
    Array.from(groupedGames).forEach(element => gamesWithId.set(element[0], element[1]))

    document.getElementById("gameText").value = "2018123005"
    onEnterId()
});


function onEnterId() {
    var id = document.getElementById("gameText").value.toString();

    if (Array.from(gamesWithId.keys()).includes(id)) {
        var groupedByEvent = d3.group(gamesWithId.get(id), d => d.event)
        var eventFrequencies = []

        Array.from(groupedByEvent).forEach(element =>
            eventFrequencies.push({ 'event': element[0], 'frequency': element[1].length }))

        updatePiegraph(eventFrequencies, 'event', 'frequency')

    } else alert("Game ID is not valid")

    document.getElementById("gameText").value = ""
}


function onEnterYear() {
    var inputVal = document.getElementById("yearText").value.toString()
    document.getElementById("yearText").value = ""
}

function onEnterPlayer() {
    var inputVal = document.getElementById("playerText").value.toString()
    document.getElementById("playerText").value = ""
}


function updatePiegraph(dataset, key, value) {
    var color = d3.scaleOrdinal(d3.schemeSpectral[11]).domain(dataset)

    var pie = d3.pie()
        .sort(function(a, b) { return d3.ascending(a[value], b[value]) })
        .value(function(d) { return d[value] });

    var path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var label = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    var arc = g.selectAll('path')
        .data(pie(dataset))

    arc.enter().append('path').merge(arc)
        .transition().duration(500)
        .attr('d', path)
        .attr('fill', function(d) { return (color(d.data[key])) })
        .attr("stroke", "gray")

    arc.exit().remove()

    var text = g.selectAll('text')
        .data(pie(dataset))

    text.enter().append('text').merge(text)
        .transition().duration(500)
        .text(function(d) {
            return d.data[key].replaceAll("_", " ")
                .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
        })
        .attr("transform", function(d) {
            return "translate(" + label.centroid(d) + ")";
        })
        .style("text-anchor", "middle")
        .style("font-size", 17)

    text.exit().remove()
}


function onCheck(checkbox) {
    switch (checkbox.id) {
        case 'gameId':
            if (checkbox.checked) {
                document.getElementById("gameText").disabled = false
                document.getElementById("gameButton").disabled = false
                document.getElementById("yearId").disabled = true
                document.getElementById("playerId").disabled = true
            } else {
                document.getElementById("gameText").disabled = true
                document.getElementById("gameButton").disabled = true
                document.getElementById("yearId").disabled = false
                document.getElementById("playerId").disabled = false
            }
            break;
        case 'yearId':
            if (checkbox.checked) {
                document.getElementById("yearText").disabled = false
                document.getElementById("yearButton").disabled = false
                document.getElementById("gameId").disabled = true
                document.getElementById("playerId").disabled = true
            } else {
                document.getElementById("yearText").disabled = true
                document.getElementById("yearButton").disabled = true
                document.getElementById("gameId").disabled = false
                document.getElementById("playerId").disabled = false
            }
            break;
        case 'playerId':
            if (checkbox.checked) {
                document.getElementById("playerText").disabled = false
                document.getElementById("playerButton").disabled = false
                document.getElementById("yearId").disabled = true
                document.getElementById("gameId").disabled = true
            } else {
                document.getElementById("playerText").disabled = true
                document.getElementById("playerButton").disabled = true
                document.getElementById("yearId").disabled = false
                document.getElementById("gameId").disabled = false
            }
            break;
    }
}



//2018123001


//     ['kickoff', 'kick_received', 'first_contact',
//         'tackle', 'ball_snap', 'extra_point_attempt',
//         'out_of_bounds', 'extra_point', 'field_goal_attempt',
//         'field_goal_missed', 'punt', 'punt_land', 'punt_received',
//         'fair_catch', 'touchback', 'kickoff_land', 'field_goal',
//         'punt_downed'
//     ])