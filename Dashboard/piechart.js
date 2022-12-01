var svg = d3.select("#piechart")
var width = +svg.attr("width")
var height = +svg.attr("height")
var radius = Math.min(width, height) / 2
var g = svg.append("g").attr("transform", "translate(" + (width / 2 + 100) + "," + (height / 2) + ")");

var groupedByGame;
var groupedByPlayer;
var groupedByYear;

var toolTip = d3.select("#piechartBody")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")

var mouseover = function(d) {
    toolTip
        .html("Event: " + d.data.event + "<br>" + "Frequency: " + d.data.frequency)
        .style("opacity", 1)
        .style("left", (d3.mouse(this)[0] + 400) + "px")
        .style("top", (d3.mouse(this)[1] + 1550) + "px")
}

var mousemove = function(d) {
    toolTip
        .style("left", (d3.mouse(this)[0] + 400) + "px")
        .style("top", (d3.mouse(this)[1] + 1550) + "px")
        .style('position', 'absolute')
}

var mouseleave = function(d) {
    toolTip
        .style("opacity", 0)
}



Promise.all([
    d3.csv("event_trackingall.csv")
]).then(function(files) {

    var filteredPlayers1 = files[0].filter(function(row) {
        return row.playerName !== 'football';
    })

    var filteredPlayers = filteredPlayers1.filter(function(row) {
        return row.event !== 'None';
    })



    groupedByGame = d3.group(files[0], d => d.gameId)
    groupedByPlayer = d3.group(filteredPlayers, d => d.playerName)
    groupedByYear = d3.group(files[0], d => d.gameId.substring(0, 4))



})


function onEnterId() {
    var id = document.getElementById("gameText").value.toString();

    if (Array.from(groupedByGame.keys()).includes(id)) {
        var groupedByEvent = d3.group(groupedByGame.get(id), d => d.event)
        var eventFrequencies = []

        groupedByEvent.forEach((value, key) => {
            eventFrequencies.push({
                'event': key.replaceAll("_", " ")
                    .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
                'frequency': value.length
            })
        })
        updatePiegraph(eventFrequencies, 'event', 'frequency')

    } else alert("Game ID is not valid")

    document.getElementById("gameText").value = ""
}


function onEnterYear() {
    var year = document.getElementById("yearText").value.toString()

    if (Array.from(groupedByYear.keys()).includes(year)) {
        var groupedByEvent = d3.group(groupedByYear.get(year), d => d.event)
        var eventFrequencies = []


        groupedByEvent.forEach((value, key) => {
            eventFrequencies.push({
                'event': key.replaceAll("_", " ")
                    .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
                'frequency': value.length
            })
        })
        updatePiegraph(eventFrequencies, 'event', 'frequency')

    } else alert("Year is not valid")
    document.getElementById("yearText").value = ""
}

function onEnterPlayer() {
    var player = document.getElementById("playerText").value.toString()

    if (Array.from(groupedByPlayer.keys()).includes(player)) {
        var groupedByEvent = d3.group(groupedByPlayer.get(player), d => d.event)
        var eventFrequencies = []

        groupedByEvent.forEach((value, key) => {
            eventFrequencies.push({
                'event': key.replaceAll("_", " ")
                    .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
                'frequency': value.length
            })
        })
        updatePiegraph(eventFrequencies, 'event', 'frequency')

    } else alert("Player Name is not valid")
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

    arc.enter().append('path')
        .on('mouseover', mouseover)
        .on('mouseleave', mouseleave)
        .on('mousemove', mousemove)
        .merge(arc)
        .attr("class", "arc")
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
            return d.data[key]
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