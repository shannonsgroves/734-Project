var groupedByPlayer = new Map();
var playerDistances = []
var playerSpeeds = []
var dataset;

var margin = { top: 10, right: 30, bottom: 200, left: 350 },
    width = 600
height = 400

var svg = d3.select("#barchart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")

svg.append("text")
    .attr("id", "x label")
    .attr("text-anchor", "end")
    .attr("x", width - 300)
    .attr("y", height + 130)
    .text("Players")

svg.append("text")
    .attr("id", "y label")
    .attr("text-anchor", "end")
    .attr("x", -200)
    .attr("y", -40)
    .attr("transform", "rotate(-90)")
    .text("Total Distance Over Season (yards)")


var xAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")

var yAxis = svg.append("g")
    .attr("class", "myYaxis")

var xScale = d3.scaleBand()
    .range([0, width])
    .padding(0.2);

var yScale = d3.scaleLinear()
    .range([height, 0]);

var barchartToolTip = d3.select("#barchartBody")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")


var mouseover2 = function(d) {
    var select = d3.select('#yScaleSelect').node();
    var option = select.options[select.selectedIndex].value
    barchartToolTip
        .style("opacity", 1)
        .style("left", (d3.mouse(this)[0] + 200) + "px")
        .style("top", (d3.mouse(this)[1] + 2050) + "px")
        .style('position', 'absolute')

    if (option === 'Total Distance') {
        barchartToolTip
            .html("Player: " + d.group + "<br> " + option + ": " + d.value + " yards")
    } else {
        barchartToolTip
            .html("Player: " + d.group + "<br> " + option + ": " + d.value + " yards/s")
    }

}

var mousemove2 = function(d) {
    toolTip
        .style("left", (d3.mouse(this)[0] + 200) + "px")
        .style("top", (d3.mouse(this)[1] + 2050) + "px")
        .style('position', 'absolute')
}


var mouseleave2 = function(d) {
    barchartToolTip
        .style("opacity", 0)
}


Promise.all([
    d3.csv("truncated_trackingall.csv")
]).then(function(files) {

    var filteredData = files[0].filter(row => { return row.playerName !== 'football' })
    groupedByPlayer = d3.group(filteredData, d => d.playerName)

    groupedByPlayer.forEach((games, player) => {
        var totalDistance = games.reduce((accumulator, row) => {
            row.distance = +row.distance
            return accumulator + row.distance
        }, 0)

        var totalSpeed = games.reduce((accumulator, row) => {
            row.speed = +row.speed
            return accumulator + row.speed
        }, 0)


        playerDistances.push({ group: player, value: +totalDistance.toFixed(2) })
        playerSpeeds.push({ group: player, value: +(totalSpeed / games.length).toFixed(2) })

    })

    dataset = playerDistances
    updateYScale()
    updateXScale(dataset)


})



function onYScaleChanged() {
    var select = d3.select('#yScaleSelect').node();
    var option = select.options[select.selectedIndex].value


    if (option === 'Total Distance') {
        dataset = playerDistances
        document.getElementById("y label").textContent = "Total Distance Over Season (yards)";
    } else {
        dataset = playerSpeeds
        document.getElementById("y label").textContent = "Average Speed Over Season (yards/s)";
    }

    document.getElementById("x label").textContent = "Players"
    updateYScale()
    updateXScale(dataset)

}

function onButtonPressed() {
    var numberPlayers = document.getElementById("numberPlayers").value;

    var zoomedDataset = dataset.slice(0, numberPlayers)
    document.getElementById("x label").textContent = "Top " + numberPlayers + " Players";
    updateXScale(zoomedDataset)

    document.getElementById("numberPlayers").value = ""
}


function updateYScale() {

    dataset.sort(function(b, a) {
        return a.value - b.value;
    })

    yScale.domain(d3.extent(dataset, d => { return d.value }))
    yAxis.transition().duration(1000).call(d3.axisLeft(yScale));
}


function updateXScale(xDataset) {
    xScale.domain(xDataset.map(function(d) { return d.group; }))
    xAxis.call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("font", "sans-serif")
        .style("text-anchor", "end");

    var rect = svg.selectAll("rect")
        .data(xDataset)

    rect.enter()
        .append("rect")
        .merge(rect)
        .on("mouseover", mouseover2)
        .on("mouseleave", mouseleave2)
        .on("mousemove", mousemove2)
        .transition()
        .duration(1000)
        .attr("x", function(d) { return xScale(d.group); })
        .attr("y", function(d) { return yScale(d.value); })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) { return height - yScale(d.value); })
        .attr("fill", "#69b3a2")


    rect.exit().remove()
}