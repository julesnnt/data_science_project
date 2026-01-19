const width = 960;
const height = 600;

const projection = d3.geoAlbersUsa().translate([width / 2, height / 2]);
const parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%SZ");

Promise.all([
  loadMap(),
  d3.csv("California_Fire_Incidents.csv", d => {
    const lat = +d.Latitude;
    const lon = +d.Longitude;
    const rawDate = parseDate(d.Started);
    const year = rawDate ? rawDate.getFullYear() : null;
    const acres = +d.AcresBurned || 0;
    return {
      lat, lon, year,
      acres,
      name: d.Name,
      county: d.Counties || "Inconnu"
    };
  })
]).then(([californiaGeo, fires]) => {
  projection.fitSize([width, height], californiaGeo);

  const radiusScale = d3.scaleSqrt()
    .domain([0, d3.max(fires, d => d.acres)])
    .range([1, 20]);

  const colorScale = d3.scaleThreshold()
    .domain([1000, 10000])
    .range(["#00f7ff", "#ff2fa0", "#8e00ff"]);

  const data = fires.filter(d => {
    const projected = projection([d.lon, d.lat]);
    return !isNaN(d.lat) && !isNaN(d.lon) && projected && d.year;
  }).map(d => {
    const [x, y] = projection([d.lon, d.lat]);
    return {
      x, y,
      date: d.year,
      acres: d.acres,
      name: d.name,
      county: d.county
    };
  });

  const chart = makeChart(californiaGeo, data, radiusScale, colorScale);
  document.getElementById("chart").appendChild(chart);

  const slider = document.getElementById("timeline");
  window.update = chart.update;

  slider.addEventListener("input", () => {
    const year = +slider.value;
    chart.update(year);
    document.getElementById("year-label").textContent = `Année : ${year}`;
  });
});

async function loadMap() {
  const us = await d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json");
  const california = us.objects.states.geometries.find(d => d.id === "06");
  const californiaGeo = topojson.feature(us, california);
  return californiaGeo;
}

function makeChart(californiaGeo, data, radiusScale, colorScale) {
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height]);

  const path = d3.geoPath().projection(projection);

  const tooltip = d3.select("body").append("div")
  .style("position", "absolute")
  .style("background", "#000")
  .style("border", "1px solid #00f7ff")
  .style("padding", "10px 14px")
  .style("border-radius", "8px")
  .style("pointer-events", "none")
  .style("font-size", "13px")
  .style("color", "#00f7ff")
  .style("display", "none")
  .style("z-index", "9999")
  .style("box-shadow", "0 0 12px rgba(0, 247, 255, 0.4)");

  svg.append("path")
    .datum(californiaGeo)
    .attr("fill", "#f5f5f5")
    .attr("stroke", "#999")
    .attr("stroke-width", 1)
    .attr("d", path);

  const g = svg.append("g")
    .attr("stroke", "#000")
    .attr("stroke-width", 0.3);

  const dots = g.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 0)
    .attr("fill", d => colorScale(d.acres))
    .on("mouseover", (event, d) => {
      tooltip
        .style("display", "block")
        .html(`<strong>${d.name}</strong><br>
              Counties : ${d.county}<br>
              Years : ${d.date}<br>
              ${d.acres.toLocaleString()} Acres burned`);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    });

  const legend = svg.append("g")
    .attr("transform", `translate(${width - 150}, ${height - 180})`)
    .attr("font-size", 12)
    .attr("fill", "#333")
    .attr("text-anchor", "start");

  const legendSizes = [1000, 10000, 100000];

  const legendColors = {
    1000: "#00f7ff",    // bleu fluo
    10000: "#ff2fa0",   // rose fluo
    100000: "#8e00ff"   // violet fluo
  };
  
  legendSizes.forEach((acres, i) => {
    const y = i * 50;
    const r = radiusScale(acres);
  
    legend.append("circle")
      .attr("cx", r)
      .attr("cy", y)
      .attr("r", r)
      .attr("fill", legendColors[acres])
      .attr("stroke", "#000");
  
    legend.append("text")
      .attr("x", r * 2 + 8)
      .attr("y", y + 4)
      .attr("fill", "#00f7ff") // texte bleu fluo
      .text(`${acres.toLocaleString()} acres`);
  });
  
  let previousDate = -Infinity;

  return Object.assign(svg.node(), {
    update(date) {
      dots
        .filter(d => d.date > previousDate && d.date <= date)
        .transition()
        .attr("r", d => radiusScale(d.acres));

      dots
        .filter(d => d.date <= previousDate && d.date > date)
        .transition()
        .attr("r", 0);

      previousDate = date;
    }
  });
}
