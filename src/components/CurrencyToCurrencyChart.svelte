<script>
	// @ts-ignore
	import * as d3 from "d3";
	import { SharedService } from "./../shared/share.service";
	import { onMount } from "svelte";

	const shared = new SharedService();
	export let currencyCode1 = "USD";
	export let currencyCode2 = "EUR";
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
	let data1 = [];
	let data2 = [];

	async function prepareData(currency, dataArray) {
		dataArray.length = 0;
		currency.forEach((element) => {
			dataArray.push({ date: element.effectiveDate, value: element.mid });
		});
	}

	let margin;
	let width;
	let height;
	let xScale;
	let yScale;
	let line1, line2;
	let area1, area2;

	let brush,
		xScaleBrush,
		brushHeight = 50;
	let xAxis, areaPath1, areaPath2, linePath1, linePath2;
	let svg;

	let pointer1, pointer2, tooltip;

	async function setChart(code1, code2) {
		const currency1 = await fetchCurrency(code1);
		const currency2 = await fetchCurrency(code2);
		await prepareData(currency1, data1);
		await prepareData(currency2, data2);

		margin = { top: 20, right: 30, bottom: 40, left: 40 };
		width = 800 - margin.left - margin.right;
		height = 400 - margin.top - margin.bottom;
		brushHeight = 50;

		const parseDate = d3.timeParse("%Y-%m-%d");
		data1.forEach((d) => {
			d.date = parseDate(d.date);
		});
		data2.forEach((d) => {
			d.date = parseDate(d.date);
		});

		xScale = d3
			.scaleTime()
			.domain(d3.extent(data1.concat(data2), (d) => d.date))
			.range([0, width]);

		yScale = d3
			.scaleLinear()
			.domain([
				d3.min(data1.concat(data2), (d) => d.value) * 0.9,
				d3.max(data1.concat(data2), (d) => d.value) * 1.1,
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
			areaPath1.attr("d", area1);
			areaPath2.attr("d", area2);
			linePath1.attr("d", line1);
			linePath2.attr("d", line2);
		}

		brush = d3
			.brushX()
			.extent([
				[0, 0],
				[width, brushHeight],
			])
			.on("brush end", brushed);

		line1 = d3
			.line()
			.x((d) => xScale(d.date))
			.y((d) => yScale(d.value));

		line2 = d3
			.line()
			.x((d) => xScale(d.date))
			.y((d) => yScale(d.value));

		area1 = d3
			.area()
			.x((d) => xScale(d.date))
			.y0(height)
			.y1((d) => yScale(d.value));

		area2 = d3
			.area()
			.x((d) => xScale(d.date))
			.y0(height)
			.y1((d) => yScale(d.value));

		clearChart();
		drawChart();
	}

	function clearChart() {
		d3.select("#chart2").selectAll("*").remove();
	}

	function drawChart() {
		const svgContainer = d3
			.select("#chart2")
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

		areaPath1 = chartArea
			.append("path")
			.data([data1])
			.attr("fill", "steelblue")
			.attr("opacity", 0.5)
			.attr("d", area1);

		areaPath2 = chartArea
			.append("path")
			.data([data2])
			.attr("fill", "orange")
			.attr("opacity", 0.5)
			.attr("d", area2);

		linePath1 = chartArea
			.append("path")
			.data([data1])
			.attr("fill", "none")
			.attr("stroke", "blue")
			.attr("stroke-width", 2)
			.attr("d", line1);

		linePath2 = chartArea
			.append("path")
			.data([data2])
			.attr("fill", "none")
			.attr("stroke", "red")
			.attr("stroke-width", 2)
			.attr("d", line2);

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

		pointer1 = svg
			.append("circle")
			.attr("r", 5)
			.attr("fill", "blue")
			.style("visibility", "hidden");

		pointer2 = svg
			.append("circle")
			.attr("r", 5)
			.attr("fill", "orange")
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

			const i1 = bisectDate(data1, mouseDate, 1);
			const i2 = bisectDate(data2, mouseDate, 1);
			const d0_1 = data1[i1 - 1];
			const d0_2 = data2[i2 - 1];

			if (!d0_1 && !d0_2) {
				pointer1.style("visibility", "hidden");
				pointer2.style("visibility", "hidden");
				tooltip.style("visibility", "hidden");
				return;
			}

			if (d0_1) {
				pointer1
					.attr("cx", xScale(d0_1.date))
					.attr("cy", yScale(d0_1.value))
					.style("visibility", "visible");
			}
			if (d0_2) {
				pointer2
					.attr("cx", xScale(d0_2.date))
					.attr("cy", yScale(d0_2.value))
					.style("visibility", "visible");
			}

			tooltip
				.html(
					`<tspan x="${xScale(d0_1.date)}" dy="-12" text-anchor="middle">${currencyCode1}: ${d0_1.value.toFixed(2)}</tspan>` +
						`<tspan x="${xScale(d0_2.date)}" dy="12" text-anchor="middle">${currencyCode2}: ${d0_2.value.toFixed(2)}</tspan>` +
						`<tspan x="${xScale(d0_1.date)}" dy="12" text-anchor="middle">${d3.timeFormat("%Y-%m-%d")(d0_1.date)}</tspan>`
				)
				.style("visibility", "visible");
		});

		svg.on("mouseleave", function () {
			pointer1.style("visibility", "hidden");
			pointer2.style("visibility", "hidden");
			tooltip.style("visibility", "hidden");
		});
	}

  $: {
    if (currencyCode1 && currencyCode2 && year) {
      setChart(currencyCode1, currencyCode2);
    }
  }
</script>

<div class="flex justify-center">
	<svg id="chart2" class="w- h-110 max-w-4xl"></svg>
</div>

<style>
	svg {
		background-color: #f4f4f4;
		border: 1px solid #ddd;
	}
</style>
