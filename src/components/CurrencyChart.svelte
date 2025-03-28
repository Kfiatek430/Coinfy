<script>
  import * as d3 from 'd3';
  
  let data = [
    { date: '2025-01-01', value: 1.1 },
    { date: '2025-01-02', value: 1.2 },
    { date: '2025-01-03', value: 1.15 },
    { date: '2025-01-04', value: 1.3 },
    { date: '2025-01-05', value: 1.25 }
  ];

  const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  let svg;
  let xScale, yScale, line;

  const parseDate = d3.timeParse('%Y-%m-%d');
  data.forEach(d => { d.date = parseDate(d.date); });

  xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, width]);

  yScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.value) - 0.1, d3.max(data, d => d.value) + 0.1])
    .range([height, 0]);

  line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value));

  import { onMount } from 'svelte';
  onMount(() => {
    svg = d3.select('#chart')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));

    svg.append('path')
      .data([data])
      .attr('fill', 'none')
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('d', line);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .style('text-anchor', 'middle')
      .text('Date');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 15)
      .style('text-anchor', 'middle')
      .text('Currency Rate');
  });
</script>

<style>
  svg {
    background-color: #f4f4f4;
    border: 1px solid #ddd;
  }
</style>

<svg id="chart"></svg>
