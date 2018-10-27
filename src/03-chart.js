import * as d3 from 'd3'

var margin = { top: 10, left: 10, right: 10, bottom: 10 }

var height = 480 - margin.top - margin.bottom

var width = 480 - margin.left - margin.right

var svg = d3
  .select('#chart-3')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')

var radius = width / 2

var radiusScale = d3
  .scaleLinear()
  .domain([10, 100])
  .range([40, radius])

var angleScale = d3
  .scalePoint()
  .domain([
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
    'Blah'
  ])
  .range([0, Math.PI * 2])

var line = d3
  .radialArea()
  .outerRadius(function(d) {
    return radiusScale(d.high_temp)
  })
  .innerRadius(function(d) {
    return radiusScale(d.low_temp)
  })
  .angle(function(d) {
    return angleScale(d.month_name)
  })

d3.csv(require('./data/all-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  var container = svg.append('g')

  function displayCity(city) {
    let cityData = datapoints.filter(d => d.city === city)
    cityData.push(cityData[0])

    return cityData
    // return data to create a loop with the target city's temps
  }

  datapoints.forEach(d => {
    d.high_temp = +d.high_temp
    d.low_temp = +d.low_temp
  })

  d3.select('#nyc-step').on('stepin', () => {
    // Filter it so I'm only looking at NYC datapoints
    console.log('nyc step working')

    container
      .append('path')
      .attr('class', 'city-temp')
      .datum(displayCity('NYC'))
      .attr('d', line)
      .attr('fill', 'black')
      .attr('opacity', 0.75)

    container
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('class', 'city-text')
      .text('NYC')
      .attr('font-size', 30)
      .attr('font-weight', 700)
      .attr('alignment-baseline', 'middle')
    // let nycDatapoints = datapoints.filter(d => d.city === 'NYC')
    // nycDatapoints.push(nycDatapoints[0])

    // container
    //   .append('path')
    //   .attr('class', 'nyc-temp nyc-hide')
    //   .datum(nycDatapoints)
    //   .attr('d', line)
    //   .attr('fill', 'black')
    //   .attr('opacity', 0.75)

    // container
    //   .append('text')
    //   .attr('text-anchor', 'middle')
    //   .attr('class', 'nyc-text nyc-hide')
    //   .text('NYC')
    //   .attr('font-size', 30)
    //   .attr('font-weight', 700)
    //   .attr('alignment-baseline', 'middle')
  })

  d3.select('#beijing-step').on('stepin', () => {
    // Filter it so I'm only looking at Beijing datapoints
    console.log('beijing step working')

    container
      .selectAll('city-temp')
      .datum(displayCity("Beijing"))
      .attr('d', line)
  })

  var circleBands = [20, 30, 40, 50, 60, 70, 80, 90]
  var textBands = [30, 50, 70, 90]

  container
    .selectAll('.bands')
    .data(circleBands)
    .enter()
    .append('circle')
    .attr('class', 'bands')
    .attr('fill', 'none')
    .attr('stroke', 'gray')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', function(d) {
      return radiusScale(d)
    })
    .lower()

  container
    .selectAll('.temp-notes')
    .data(textBands)
    .enter()
    .append('text')
    .attr('class', 'temp-notes')
    .attr('x', 0)
    .attr('y', d => -radiusScale(d))
    .attr('dy', -2)
    .text(d => d + '°')
    .attr('text-anchor', 'middle')
    .attr('font-size', 8)

  function render() {
    // Calculate height/width
    let screenWidth = svg.node().parentNode.parentNode.offsetWidth
    let screenHeight = window.innerHeight
    let newWidth = screenWidth - margin.left - margin.right
    let newHeight = screenHeight - margin.top - margin.bottom

    // Update your SVG
    let actualSvg = d3.select(svg.node().parentNode)
    actualSvg
      .attr('height', newHeight + margin.top + margin.bottom)
      .attr('width', newWidth + margin.left + margin.right)
    let container = svg.attr(
      'transform',
      'translate(' + newWidth / 2 + ',' + newHeight / 2 + ')'
    )
    // Update scales (depends on your scales)
    var newRadius = newWidth / 2
    radiusScale.range([newRadius, 0])

    var line = d3
      .radialArea()
      .outerRadius(function(d) {
        return radiusScale(d.high_temp)
      })
      .innerRadius(function(d) {
        return radiusScale(d.low_temp)
      })
      .angle(function(d) {
        return angleScale(d.month_name)
      })

    // Reposition/redraw your elements
    container.selectAll('.temp').attr('d', line)

    container
      .selectAll('.bands')
      .attr('r', function(d) {
        return radiusScale(d)
      })
      .lower()

    container.selectAll('.city-name').attr('font-size', 12)
    // change font sized based on screensize. Currently bugs during
    // resize and back-stepping
    // container.selectAll('.city-name').attr('font-size', d => {
    //   if (newRadius < 250) {
    //     return 12
    //   } else {
    //     return 30
    //   }
    // })

    container.selectAll('.temp-notes').attr('y', d => -radiusScale(d))

    // Update axes if necessary
  }
  window.addEventListener('resize', render)
  render()
}
