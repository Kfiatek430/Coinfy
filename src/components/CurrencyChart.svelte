<script>
	// @ts-ignore
	import * as d3 from "d3";
	import { SharedService } from "./../shared/share.service";
	import { onMount } from "svelte";

	const shared = new SharedService();
	export let currencyCode = "USD";
	export let year = "2025";

	async function fetchCurrency(code) {
		const tables = await shared.getTables();

		code = code.toUpperCase();

		let table = tables.find((element) => element.code === code);
		if (!table) {
			table = tables.find((element) => element.code === "USD");
		}

		const startDate = new Date(`${year}-01-01`);
		const today = new Date();
		const isCurrentYear = parseInt(year) === today.getFullYear();
		const endDate = isCurrentYear ? today : new Date(`${year}-12-31`);

		const currency = await shared.getRates(table, startDate, endDate);

		return currency;
	}

	/**
	 * @type {{ date: string; value: number; }[]}
	 */
	let data = [];

	async function prepareData(currency) {
		data = [];
		currency.forEach((element) => {
			data.push({ date: element.effectiveDate, value: element.mid });
		});
	}

	let margin;
	let width;
	let height;
	let xScale;
	let yScale;
	let line;
	let area;

	let brush,
		xScaleBrush,
		brushHeight = 50;
	let xAxis, areaPath, linePath;
	let svg;

	let pointer, tooltip;

	async function setChart(code) {
		const currency = await fetchCurrency(code);
		await prepareData(currency);

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

		clearChart();
		drawChart();
	}

	function clearChart() {
		d3.select("#chart").selectAll("*").remove();
	}

	function drawChart() {
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

		svg
			.append("g")
			.attr("class", "grid")
			.selectAll("line")
			.data(yScale.ticks(5))
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
			.data(xScale.ticks(10))
			.enter()
			.append("line")
			.attr("x1", (d) => xScale(d))
			.attr("x2", (d) => xScale(d))
			.attr("y1", 0)
			.attr("y2", height)
			.attr("stroke", "#ddd")
			.attr("stroke-width", 0.5)
			.attr("stroke-dasharray", "2,2");

		xAxis = svg
			.append("g")
			.attr("transform", `translate(0,${height})`)
			.call(d3.axisBottom(xScale));

		const yAxis = svg.append("g").call(d3.axisLeft(yScale));

		areaPath = chartArea
			.append("path")
			.data([data])
			.attr("fill", "steelblue")
			.attr("opacity", 0.5)
			.attr("d", area);

		linePath = chartArea
			.append("path")
			.data([data])
			.attr("fill", "none")
			.attr("stroke", "blue")
			.attr("stroke-width", 2)
			.attr("d", line);

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

		pointer = svg
			.append("circle")
			.attr("r", 5)
			.attr("fill", "blue")
			.style("visibility", "hidden");

		tooltip = svg
			.append("text")
			.attr("x", 10)
			.attr("y", 10)
			.attr("fill", "black")
			.style("visibility", "hidden")
			.style("font-size", "12px")
			.style("text-anchor", "middle");

		const bisectDate = d3.bisector((d) => d.date).left;

		svg.on("mousemove", function (event) {
			const mouseX = d3.pointer(event)[0];
			const mouseDate = xScale.invert(mouseX);

			const i = bisectDate(data, mouseDate, 1);
			const d0 = data[i - 1];
			const d1 = data[i];

			if (!d0) {
				pointer.style("visibility", "hidden");
				tooltip.style("visibility", "hidden");
				return;
			}

			const closestDataPoint =
				d1 && mouseDate - d0.date > d1.date - mouseDate ? d1 : d0;

			const closestYValue = yScale(closestDataPoint.value);

			pointer
				.attr("cx", xScale(closestDataPoint.date))
				.attr("cy", closestYValue)
				.style("visibility", "visible");

			tooltip
				.html(
					`<tspan x="${xScale(closestDataPoint.date)}" dy="-12" text-anchor="middle">Value: ${closestDataPoint.value.toFixed(2)}</tspan>` +
						`<tspan x="${xScale(closestDataPoint.date)}" dy="12" text-anchor="middle">${d3.timeFormat("%Y-%m-%d")(closestDataPoint.date)}</tspan>`
				)
				.style("visibility", "visible");
		});

		svg.on("mouseleave", function () {
			pointer.style("visibility", "hidden");
			tooltip.style("visibility", "hidden");
		});
	}

	$: {
		if (currencyCode && year) {
			setChart(currencyCode);
		}
	}
</script>

<div class="flex justify-center">
	<svg id="chart" class="w- h-110 max-w-4xl"></svg>
</div>

<style>
	svg {
		background-color: #f4f4f4;
		border: 1px solid #ddd;
	}
</style>
