import * as d3 from 'd3'
import { debounce } from 'debounce'

let margin = { top: 100, left: 50, right: 150, bottom: 30 }

let height = 700 - margin.top - margin.bottom

let width = 600 - margin.left - margin.right

let svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let parseTime = d3.timeParse('%B-%y')

let xPositionScale = d3.scaleLinear().range([0, width])
let yPositionScale = d3.scaleLinear().range([height, 0])

let colorScale = d3
  .scaleOrdinal()
  .range([
    '#8dd3c7',
    '#ffffb3',
    '#bebada',
    '#fb8072',
    '#80b1d3',
    '#fdb462',
    '#b3de69',
    '#fccde5',
    '#d9d9d9',
    '#bc80bd'
  ])

let line = d3
  .line()
  .x(function(d) {
    return xPositionScale(d.datetime)
  })
  .y(function(d) {
    return yPositionScale(d.price)
  })

d3.csv(require('./data/housing-prices.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  datapoints.forEach(d => {
    d.datetime = parseTime(d.month)
  })
  let dates = datapoints.map(d => d.datetime)
  let prices = datapoints.map(d => +d.price)

  xPositionScale.domain(d3.extent(dates))
  yPositionScale.domain(d3.extent(prices))

  let nested = d3
    .nest()
    .key(function(d) {
      return d.region
    })
    .entries(datapoints)

  let rectWidth =
    xPositionScale(parseTime('February-17')) -
    xPositionScale(parseTime('November-16'))

  svg
    .append('text')
    .attr('class', 'title-housing')
    .attr('font-size', '24')
    .attr('text-anchor', 'middle')
    .text('U.S. housing prices fall in winter')
    .attr('x', width / 2)
    .attr('y', -40)
    .attr('dx', 40)

  let xAxis = d3
    .axisBottom(xPositionScale)
    .tickFormat(d3.timeFormat('%b %y'))
    .ticks(9)
  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  let yAxis = d3.axisLeft(yPositionScale)
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)

  d3.select('#price-start').on('stepin', () => {
    svg.selectAll('.prices').style('visibility', 'hidden')
    svg.selectAll('.location-dots').style('visibility', 'hidden')
    svg.selectAll('.region-text').style('visibility', 'hidden')

  })

  // Draw the lines, dots and region names
  d3.select('#price-lines').on('stepin', () => {
    svg
      .selectAll('.prices')
      .data(nested)
      .enter()
      .append('path')
      .attr('class', d => {
        let regionName = d.key.toLowerCase().replace(/[\s.]/g, '')
        let regionClasses = regionName + ' prices'
        let highlightClass = [
          'mountain',
          'pacific',
          'westsouthcentral',
          'southatlantic'
        ]
        if (highlightClass.indexOf(regionName) !== -1) {
          let highlightRegion = regionClasses + ' region-highlight-step'
          return highlightRegion
        } else {
          return regionClasses
        }
      })
      .attr('d', function(d) {
        return line(d.values)
      })
      .attr('stroke', function(d) {
        return colorScale(d.key)
      })
      .attr('stroke-width', 2)
      .attr('fill', 'none')

    svg
      .selectAll('location-dots')
      .data(nested)
      .enter()
      .append('circle')
      .attr('class', d => {
        let regionName = d.key.toLowerCase().replace(/[\s.]/g, '')
        let regionClasses = regionName + ' location-dots'
        let highlightClass = [
          'mountain',
          'pacific',
          'westsouthcentral',
          'southatlantic'
        ]
        if (highlightClass.indexOf(regionName) !== -1) {
          let highlightRegion = regionClasses + ' region-highlight-step'
          return highlightRegion
        } else {
          return regionClasses
        }
      })
      .attr('fill', function(d) {
        return colorScale(d.key)
      })
      .attr('r', 4)
      .attr('cy', function(d) {
        return yPositionScale(d.values[0].price)
      })
      .attr('cx', function(d) {
        return xPositionScale(d.values[0].datetime)
      })

    svg
      .selectAll('.region-text')
      .data(nested)
      .enter()
      .append('text')
      .attr('class', d => {
        let regionName = d.key.toLowerCase().replace(/[\s.]/g, '')
        let regionClasses = regionName + ' region-text'
        let highlightClass = [
          'mountain',
          'pacific',
          'westsouthcentral',
          'southatlantic'
        ]
        if (highlightClass.indexOf(regionName) !== -1) {
          let highlightRegion = regionClasses + ' region-highlight-step'
          return highlightRegion
        } else {
          return regionClasses
        }
      })
      .attr('y', function(d) {
        return yPositionScale(d.values[0].price)
      })
      .attr('x', function(d) {
        return xPositionScale(d.values[0].datetime)
      })
      .text(function(d) {
        return d.key
      })
      .attr('dx', 6)
      .attr('dy', 4)
      .attr('font-size', '12')
    // reset colors
    svg.selectAll('.prices').attr('stroke', d => {
      return colorScale(d.key)
    })
    // return the highlighted line from step 2 to normal
    svg
      .selectAll('text')
      .attr('fill', 'black')
      .attr('font-weight', 'normal')

    // un hide everything from step 1
    svg.selectAll('.prices').style('visibility', 'visible')
    svg.selectAll('.location-dots').style('visibility', 'visible')
    svg.selectAll('.region-text').style('visibility', 'visible')
  })

  d3.select('#grey-out').on('stepin', () => {
    svg.selectAll('.prices').attr('stroke', 'grey')
    svg.selectAll('.location-dots').attr('fill', 'grey')
    svg.selectAll('text').attr('fill', 'grey')

    svg.selectAll('path.us').attr('stroke', 'red')
    svg.selectAll('circle.us').attr('fill', 'red')
    svg
      .selectAll('text.us')
      .attr('fill', 'red')
      .attr('font-weight', 'bold')
  })

  d3.select('#region-highlight').on('stepin', () => {
    svg.selectAll('circle.region-highlight-step').attr('fill', 'lightblue')

    svg.selectAll('path.region-highlight-step').attr('stroke', 'lightblue')

    svg.selectAll('text.region-highlight-step').attr('fill', 'lightblue')

    svg.select('.winter').style('visibility', 'hidden')
  })

  d3.select('#draw-rect').on('stepin', () => {
    let screenHeight = window.innerHeight
    let newHeight = screenHeight - margin.top - margin.bottom

    svg
      .append('rect')
      .attr('class', 'winter')
      .attr('x', xPositionScale(parseTime('December-16')))
      .attr('y', 0)
      .attr('width', rectWidth)
      .attr('height', newHeight)
      .attr('fill', '#C2DFFF')
      .style('visibility', 'visible')
      .lower()
  })

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

    // Update scales (depends on your scales)
    xPositionScale.range([0, newWidth])
    yPositionScale.range([newHeight, 0])

    // Reposition/redraw your elements
    // draw lines
    svg.selectAll('.prices').attr('d', function(d) {
      return line(d.values)
    })
    // draw dots
    svg
      .selectAll('.location-dots')
      .attr('cy', function(d) {
        return yPositionScale(d.values[0].price)
      })
      .attr('cx', function(d) {
        return xPositionScale(d.values[0].datetime)
      })
    // draw text
    svg
      .selectAll('.region-text')
      .attr('y', function(d) {
        return yPositionScale(d.values[0].price)
      })
      .attr('x', function(d) {
        return xPositionScale(d.values[0].datetime)
      })
    svg.select('.title-housing').attr('x', newWidth / 2)
    let rectWidth =
      xPositionScale(parseTime('February-17')) -
      xPositionScale(parseTime('November-16'))
    svg
      .select('.winter')
      .attr('x', xPositionScale(parseTime('December-16')))
      .attr('width', rectWidth)
      .attr('height', newHeight)
      .lower()
    // Update axes if necessary
    svg
      .select('.x-axis')
      .attr('transform', 'translate(0,' + newHeight + ')')
      .call(xAxis)
    svg.select('.y-axis').call(yAxis)
  }
  window.addEventListener('resize', debounce(render, 200))
  render()
}
