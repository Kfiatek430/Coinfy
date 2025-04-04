<script>
	// @ts-ignore
	import * as d3 from "d3";
	import { SharedService } from "./../shared/share.service";
	import { onMount } from "svelte";

	const shared = new SharedService();
	
	export let currencyCode1 = "USD"; 
	export let currencyCode2 = "EUR"; 
	export let amount = 1;

	console.log(currencyCode1, currencyCode2, amount);

	async function fetchCurrency(code) {
		const tables = await shared.getTables();
		console.log(tables);

		code = code.toUpperCase();

		let table = tables.find((element) => element.code === code);
		if (!table) {
			table = tables.find((element) => element.code === "USD");
		}

		console.log(table);

		const currency = await shared.getRates(
			table,
			new Date("2024-01-01"),
			new Date("2025-01-01")
		);

		return currency;
	}

	/**
	 * @type {{ date: string; value: number; }[]}
	 */
	let data1 = [];
	let data2 = [];
	// Nowa seria danych: wartość przeliczenia
	let convertedData = [];

	async function prepareData(currency, dataArray) {
		dataArray.length = 0;
		currency.forEach((element) => {
			dataArray.push({ date: element.effectiveDate, value: element.mid });
		});
	}

	// Funkcja łącząca dane i obliczająca convertedAmount dla każdej daty
	function computeConvertedData() {
		convertedData.length = 0;
		// Zakładamy, że data1 i data2 mają takie same daty (lub przynajmniej odpowiadają sobie po indeksie)
		data1.forEach((d, i) => {
			const d2 = data2[i];
			if(d2) {
				convertedData.push({ 
					date: d.date, 
					// Wynik przeliczania jako liczba, zaokrąglony do 2 miejsc po przecinku
					value: +(amount * d.value / d2.value).toFixed(2) 
				});
			}
		});
	}

	let margin;
	let width;
	let height;
	let xScale;
	let yScale;
	let lineConverted, areaConverted;

	let brush,
		xScaleBrush,
		brushHeight = 50;
	let xAxis, linePath, areaPath;
	let svg;

	let pointer, tooltip;

	async function setChart(code1, code2) {
		// Pobierz kursy dla obu walut
		const currency1 = await fetchCurrency(code1);
		const currency2 = await fetchCurrency(code2);
		await prepareData(currency1, data1);
		await prepareData(currency2, data2);
		
		// Oblicz serię konwersji wg wzoru
		computeConvertedData();

		margin = { top: 20, right: 30, bottom: 40, left: 40 };
		width = 800 - margin.left - margin.right;
		height = 400 - margin.top - margin.bottom;
		brushHeight = 50;

		const parseDate = d3.timeParse("%Y-%m-%d");
		// Konwertujemy daty w obu seriach na obiekt Date
		data1.forEach((d) => {
			d.date = parseDate(d.date);
		});
		data2.forEach((d) => {
			d.date = parseDate(d.date);
		});
		// Przekonwertuj daty w convertedData
		convertedData.forEach((d) => {
			// Jeśli data jest stringiem, zamień na Date
			if (typeof d.date === "string") {
				d.date = parseDate(d.date);
			}
		});

		// Ustal zakres osi x na podstawie dat z przeliczeń
		xScale = d3
			.scaleTime()
			.domain(d3.extent(convertedData, (d) => d.date))
			.range([0, width]);

		// Ustal zakres osi y na podstawie wartości przeliczeń
		yScale = d3
			.scaleLinear()
			.domain([
				d3.min(convertedData, (d) => d.value) * 0.9,
				d3.max(convertedData, (d) => d.value) * 1.1,
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
			areaPath.attr("d", areaConverted);
			linePath.attr("d", lineConverted);
		}

		brush = d3
			.brushX()
			.extent([
				[0, 0],
				[width, brushHeight],
			])
			.on("brush end", brushed);

		// Funkcje liniowe i obszarowe dla przeliczonej wartości
		lineConverted = d3
			.line()
			.x((d) => xScale(d.date))
			.y((d) => yScale(d.value));

		areaConverted = d3
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

		// Dodaj linie siatki
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

		// Rysuj obszar i linię dla przeliczonej wartości
		areaPath = chartArea
			.append("path")
			.data([convertedData])
			.attr("fill", "green")
			.attr("opacity", 0.5)
			.attr("d", areaConverted);

		linePath = chartArea
			.append("path")
			.data([convertedData])
			.attr("fill", "none")
			.attr("stroke", "darkgreen")
			.attr("stroke-width", 2)
			.attr("d", lineConverted);

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

		// Ustawienie wskaźnika (kółka) i tooltipa dla interakcji
		pointer = svg
			.append("circle")
			.attr("r", 5)
			.attr("fill", "darkgreen")
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
			const i = bisectDate(convertedData, mouseDate, 1);
			const d0 = convertedData[i - 1];

			if (!d0) {
				pointer.style("visibility", "hidden");
				tooltip.style("visibility", "hidden");
				return;
			}

			pointer
				.attr("cx", xScale(d0.date))
				.attr("cy", yScale(d0.value))
				.style("visibility", "visible");

			tooltip
				.html(
					`<tspan x="${xScale(d0.date)}" dy="-12" text-anchor="middle">Kwota: ${amount}</tspan>` +
					`<tspan x="${xScale(d0.date)}" dy="12" text-anchor="middle">Przeliczenie: ${d0.value}</tspan>` +
					`<tspan x="${xScale(d0.date)}" dy="12" text-anchor="middle">${d3.timeFormat("%Y-%m-%d")(d0.date)}</tspan>`
				)
				.style("visibility", "visible");
		});

		svg.on("mouseleave", function () {
			pointer.style("visibility", "hidden");
			tooltip.style("visibility", "hidden");
		});
	}

	$: {
		if (currencyCode1 && currencyCode2 && amount !== undefined) {
			console.log("Zmiana parametrów:", currencyCode1, currencyCode2, amount);
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
