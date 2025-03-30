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
		currency.forEach((element) => {
			data.push({ date: element.effectiveDate, value: element.mid });
		});
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

	let area;

	let brush,
		xScaleBrush,
		brushHeight = 50;
	let xAxis, areaPath, linePath;
	let svg;

	let pointer, tooltip;

	async function setChart() {
		await prepareData();
		margin = { top: 20, right: 30, bottom: 40, left: 40 };
		width = 800 - margin.left - margin.right;
		height = 400 - margin.top - margin.bottom;
		brushHeight = 50;

		const parseDate = d3.timeParse("%Y-%m-%d");
		data.forEach((d) => {
			d.date = parseDate(d.date);
		});

		xScale = d3
			.scaleTime()
			.domain(d3.extent(data, (d) => d.date))
			.range([0, width]);

		yScale = d3
			.scaleLinear()
			.domain([
				d3.min(data, (d) => d.value) * 0.9,
				d3.max(data, (d) => d.value) * 1.1,
			])
			.range([height, 0]);

		xScaleBrush = d3.scaleTime().domain(xScale.domain()).range([0, width]);

		function brushed(event) {
			if (event.selection) {
				const [x0, x1] = event.selection.map(xScaleBrush.invert);
				xScale.domain([x0, x1]);
			} else {
				xScale.domain(xScaleBrush.domain());
			}

			xAxis.call(d3.axisBottom(xScale));
			areaPath.attr("d", area);
			linePath.attr("d", line);
		}

		brush = d3
			.brushX()
			.extent([
				[0, 0],
				[width, brushHeight],
			])
			.on("brush end", brushed);

		line = d3
			.line()
			.x((d) => xScale(d.date))
			.y((d) => yScale(d.value));

		area = d3
			.area()
			.x((d) => xScale(d.date))
			.y0(height)
			.y1((d) => yScale(d.value));
	}

	onMount(async () => {
		await setChart();

		const svgContainer = d3
			.select("#chart")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom + brushHeight + 20);

		svg = svgContainer
			.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		const clip = svg
			.append("defs")
			.append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("width", width)
			.attr("height", height);

		const chartArea = svg.append("g").attr("clip-path", "url(#clip)");

		// Grid lines
		svg
			.append("g")
			.attr("class", "grid")
			.selectAll("line")
			.data(yScale.ticks(5)) // Horizontal grid lines
			.enter()
			.append("line")
			.attr("x1", 0)
			.attr("x2", width)
			.attr("y1", (d) => yScale(d))
			.attr("y2", (d) => yScale(d))
			.attr("stroke", "#ddd")
			.attr("stroke-width", 0.5)
			.attr("stroke-dasharray", "2,2");

		svg
			.append("g")
			.attr("class", "grid")
			.selectAll("line")
			.data(xScale.ticks(10)) // Vertical grid lines
			.enter()
			.append("line")
			.attr("x1", (d) => xScale(d))
			.attr("x2", (d) => xScale(d))
			.attr("y1", 0)
			.attr("y2", height)
			.attr("stroke", "#ddd")
			.attr("stroke-width", 0.5)
			.attr("stroke-dasharray", "2,2");

		// Axes
		xAxis = svg
			.append("g")
			.attr("transform", `translate(0,${height})`)
			.call(d3.axisBottom(xScale));

		const yAxis = svg.append("g").call(d3.axisLeft(yScale));

		// Main area chart
		areaPath = chartArea
			.append("path")
			.data([data])
			.attr("fill", "steelblue")
			.attr("opacity", 0.5)
			.attr("d", area);

		// Main line chart
		linePath = chartArea
			.append("path")
			.data([data])
			.attr("fill", "none")
			.attr("stroke", "blue")
			.attr("stroke-width", 2)
			.attr("d", line);

		// Brush area
		const brushContainer = svgContainer
			.append("g")
			.attr(
				"transform",
				`translate(${margin.left}, ${height + margin.bottom})`
			);

		brushContainer.append("g").call(d3.axisBottom(xScaleBrush).ticks(10));

		const brushArea = brushContainer
			.append("g")
			.attr("class", "brush")
			.call(brush);

		brushArea
			.selectAll(".selection")
			.attr("fill", "#777")
			.attr("fill-opacity", 0.3);

		// Pointer and tooltip
		pointer = svg
			.append("circle")
			.attr("r", 5)
			.attr("fill", "red")
			.style("visibility", "hidden");

		tooltip = svg
			.append("text")
			.attr("x", 10)
			.attr("y", 10)
			.attr("fill", "black")
			.style("visibility", "hidden");

		// Create a bisector to find the closest point in the data
		const bisectDate = d3.bisector((d) => d.date).left;

		// Pointer follows mouse across entire chart
		svg.on("mousemove", function (event) {
			const mouseX = d3.pointer(event)[0];
			const mouseDate = xScale.invert(mouseX);

			// Find the index of the closest date
			const i = bisectDate(data, mouseDate, 1);
			const d0 = data[i - 1];
			const d1 = data[i];

			// If the date is out of the bounds of the data array
			if (!d0) {
				pointer.style("visibility", "hidden");
				tooltip.style("visibility", "hidden");
				return;
			}

			// Interpolate the y-value between the two closest data points
			const closestDataPoint =
				d1 && mouseDate - d0.date > d1.date - mouseDate ? d1 : d0;

			// Calculate the exact y position for the pointer using the yScale
			const closestYValue = yScale(closestDataPoint.value);

			// Update pointer position and tooltip
			pointer
				.attr("cx", xScale(closestDataPoint.date))
				.attr("cy", closestYValue)
				.style("visibility", "visible");

			tooltip
				.text(
					`Date: ${d3.timeFormat("%Y-%m-%d")(closestDataPoint.date)} | Value: ${closestDataPoint.value.toFixed(2)}`
				)
				.attr("x", xScale(closestDataPoint.date) + 10)
				.attr("y", closestYValue - 10)
				.style("visibility", "visible");
		});

		svg.on("mouseleave", function () {
			pointer.style("visibility", "hidden");
			tooltip.style("visibility", "hidden");
		});
	});
</script>

<svg id="chart"></svg>

<style>
	svg {
		background-color: #f4f4f4;
		border: 1px solid #ddd;
	}
</style>
