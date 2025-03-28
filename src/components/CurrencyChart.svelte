<script>
  // @ts-ignore
  import * as d3 from "d3";
  import { SharedService } from "./../shared/share.service";
  import { onMount } from "svelte";

  const shared = new SharedService();

  async function fetchCurrency() {
    const tables = await shared.getTables();
    console.log(tables[0]);
    const currency = await shared.getRates(
      tables[0],
      new Date("2024-01-01"),
      new Date("2025-01-01")
    );
    return currency;
  }

  /**
   * @type {{ date: string; value: number; }[]}
   */
  let data = [];

  async function prepareData() {
    const currency = await fetchCurrency();
    currency.forEach(element => {
      data.push({ date: element.effectiveDate, value: element.mid })
    })
  }

  /**
   * @type {{ left: any; right: any; top: any; bottom: any; }}
   */
  let margin;
  /**
   * @type {number}
   */
  let width;
  /**
   * @type {number}
   */
  let height; 
  /**
   * @type {(arg0: any) => any}
   */
  let xScale;
  /**
   * @type {(arg0: any) => any}
   */
  let yScale;
  /**
   * @type {any}
   */
  let line;

  async function setChart() {
    await prepareData();
    margin = { top: 20, right: 30, bottom: 40, left: 40 };
    width = 800 - margin.left - margin.right;
    height = 400 - margin.top - margin.bottom;

    const parseDate = d3.timeParse("%Y-%m-%d");
    data.forEach((d) => {
      d.date = parseDate(d.date);
    });

    xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (/** @type {{ date: any; }} */ d) => d.date))
      .range([0, width]);

    yScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (/** @type {{ value: any; }} */ d) => d.value) - 0.1,
        d3.max(data, (/** @type {{ value: any; }} */ d) => d.value) + 0.1,
      ])
      .range([height, 0]);

    line = d3
      .line()
      .x((/** @type {{ date: any; }} */ d) => xScale(d.date))
      .y((/** @type {{ value: any; }} */ d) => yScale(d.value));
  }

  let svg;

  onMount(async () => {
      await setChart();

      svg = d3
        .select("#chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

      svg.append("g").call(d3.axisLeft(yScale));

      svg
        .append("path")
        .data([data])
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("d", line);

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Date");

      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .style("text-anchor", "middle")
        .text("Currency Rate");
    });
</script>

<style>
  svg {
    background-color: #f4f4f4;
    border: 1px solid #ddd;
  }
</style>

<svg id="chart"></svg>
