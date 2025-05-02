// Load CSV data (numerical part)
d3.text('Copy_of_Group1_ENI_102_00040_ Internal_Analysis_Real_NPV_Template.csv').then(raw => {
    const rows = d3.csvParseRows(raw);

    // Second row contains the years
    const yearRow = rows[1].slice(1);
    const years = yearRow.map(y => y.trim());

    // Find the row with 'Anticipated Annual Revenue'
    const revenueRow = rows.find(r => r[0] && r[0].trim() === 'Anticipated Annual Revenue');
    if (!revenueRow) {
        console.error("Anticipated Annual Revenue row not found!");
        return;
    }

    const revenueValues = revenueRow.slice(1).map(val => {
        if (!val) return 0;
        let cleaned = val.replace(/[฿,]/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    });

    console.log('Extracted Years:', years);
    console.log('Extracted Revenue:', revenueValues);

    drawNumericalChart(years, revenueValues);
    drawThailandMap();
    drawTextualChart();
});

// Numerical Data: Line Chart
function drawNumericalChart(years, revenue) {
    const width = 700, height = 400, margin = { top: 50, right: 50, bottom: 50, left: 70 };

    const svg = d3.select("#numerical-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const xScale = d3.scalePoint()
        .domain(years)
        .range([margin.left, width - margin.right]);

    const yMax = d3.max(revenue);
    const yScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([height - margin.bottom, margin.top]);

    const area = d3.area()
        .x((d, i) => xScale(years[i]))
        .y0(height - margin.bottom)
        .y1(d => yScale(d))
        .curve(d3.curveMonotoneX);

    const line = d3.line()
        .x((d, i) => xScale(years[i]))
        .y(d => yScale(d))
        .curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(revenue)
        .attr("fill", "lightblue")
        .attr("d", area);

    svg.append("path")
        .datum(revenue)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 2)
        .attr("d", line);

    svg.selectAll("circle")
        .data(revenue)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => xScale(years[i]))
        .attr("cy", d => yScale(d))
        .attr("r", 5)
        .attr("fill", "purple")
        .attr("stroke", "white")
        .attr("stroke-width", 2);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .attr("x", -(height / 2))
        .attr("y", 20)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Revenue (฿)");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .style("text-anchor", "middle")
        .text("Year");
}

// Spatial Data: Map of Thailand with Circles
async function drawThailandMap() {
    const width = 700, height = 500;

    const svg = d3.select("#spatial-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoMercator()
        .center([100, 15])
        .scale(2500)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const thailand = await d3.json('th.json');

    svg.selectAll("path")
        .data(thailand.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#e0e0e0")
        .attr("stroke", "#333");

    const regions = [
        { name: "Bangkok", coords: [100.5018, 13.7563], income: 1000 },
        { name: "Chiang Mai", coords: [98.9817, 18.7061], income: 600 },
        { name: "Khon Kaen", coords: [102.8350, 16.4419], income: 400 },
        { name: "Ubon Ratchathani", coords: [104.8282, 15.2384], income: 300 },
        { name: "Mae Hong Son", coords: [97.9654, 19.3020], income: 200 }
    ];

    const maxIncome = d3.max(regions, d => d.income);

    svg.selectAll("circle")
        .data(regions)
        .enter()
        .append("circle")
        .attr("cx", d => projection(d.coords)[0])
        .attr("cy", d => projection(d.coords)[1])
        .attr("r", d => (d.income / maxIncome) * 30)
        .attr("fill", "rgba(0, 150, 255, 0.5)")
        .attr("stroke", "#003366")
        .attr("stroke-width", 1.5)
        .append("title")
        .text(d => `${d.name}: ฿${d.income}`);

    svg.selectAll("text")
        .data(regions)
        .enter()
        .append("text")
        .attr("x", d => projection(d.coords)[0] + 5)
        .attr("y", d => projection(d.coords)[1] - 5)
        .text(d => d.name)
        .attr("font-size", "10px")
        .attr("fill", "#333");
}

// Textual Data: Simulated Word Frequency
function drawTextualChart() {
    const container = d3.select("#textual-chart");

    const assumptions = [
        "• Demand: We assumed that demand will grow slowly from 2025 to 2028, then exponentially after 2029 as market adoption increases.",
        "• Cost: We accounted for website maintenance, cloud storage, employee training, and wages, scaling with projected user growth.",
        "• Risk: We anticipated moderate market risk, adjusting revenue forecasts conservatively in early years.",
        "• Profit: Calculations were based on subscription income minus operational costs, reflecting realistic margins.",
        "• Regional Use: Bangkok shows the highest expected use, while rural and non-urban regions contribute less revenue."
    ];

    container.append("div")
        .attr("class", "assumptions")
        .selectAll("p")
        .data(assumptions)
        .enter()
        .append("p")
        .text(d => d)
        .style("text-align", "left")
        .style("max-width", "600px")
        .style("margin", "0 auto 10px auto")
        .style("line-height", "1.6");
}
