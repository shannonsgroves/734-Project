var groupedByPlayer = new Map();
var playerDistances = []
var playerSpeeds = []
var dataset;

var margin = { top: 30, right: 30, bottom: 100, left: 60 },
    width = 600
height = 400 - margin.top - margin.bottom

var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")

svg.append("text")
    .attr("id", "x label")
    .attr("text-anchor", "end")
    .attr("x", width - 300)
    .attr("y", height + 90)
    .text("Players")

svg.append("text")
    .attr("id", "y label")
    .attr("text-anchor", "end")
    .attr("x", -50)
    .attr("y", -40)
    .attr("transform", "rotate(-90)")
    .text("Total Distance Over Season")


var xAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")

var yAxis = svg.append("g")
    .attr("class", "myYaxis")

var xScale = d3.scaleBand()
    .range([0, width])
    .padding(0.2);

var yScale = d3.scaleLinear()
    .range([height, 0]);



Promise.all([
    d3.csv("tracking2018_gameId_2018123001.csv")
    //d3.csv("file2.csv"),
]).then(function(files) {
    // files[0] will contain file1.csv
    // files[1] will contain file2.csv
    var filteredData = files[0].filter(row => { return row.displayName !== 'football' })
    groupedByPlayer = d3.group(filteredData, d => d.displayName)

    groupedByPlayer.forEach((games, player) => {
        var totalDistance = games.reduce((accumulator, row) => {
            row.dis = +row.dis
            return accumulator + row.dis
        }, 0)

        var totalSpeed = games.reduce((accumulator, row) => {
            row.s = +row.s
            return accumulator + row.s
        }, 0)


        playerDistances.push({ group: player, value: +totalDistance.toFixed(2) })
        playerSpeeds.push({ group: player, value: +(totalSpeed / games.length).toFixed(2) })

    })

    dataset = playerDistances
    updateYScale()
    updateXScale(dataset)


}).catch(function(err) {
    // handle error here
})



function onYScaleChanged() {
    var select = d3.select('#yScaleSelect').node();
    var option = select.options[select.selectedIndex].value


    if (option === 'Total Distance') {
        dataset = playerDistances
        document.getElementById("y label").textContent = "Total Distance Over Season";
    } else {
        dataset = playerSpeeds
        document.getElementById("y label").textContent = "Average Speed Over Season";
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
        .style("text-anchor", "end");

    var rect = svg.selectAll("rect")
        .data(xDataset)

    rect.enter()
        .append("rect")
        .merge(rect)
        .transition()
        .duration(1000)
        .attr("x", function(d) { return xScale(d.group); })
        .attr("y", function(d) { return yScale(d.value); })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) { return height - yScale(d.value); })
        .attr("fill", "#69b3a2")


    rect.exit().remove()
}