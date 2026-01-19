(() => {
  const tooltip = d3.select("#tooltip");

  d3.csv("California_Fire_Incidents.csv").then(raw => {
    const cleaned = new Map();

    raw.forEach(d => {
      const name = d.Name?.trim();
      const acres = +d.AcresBurned;
      const fatalities = +d.Fatalities || 0;
      const injuries = +d.Injuries || 0;

      if (name && acres > 0 && (fatalities > 0 || injuries > 0)) {
        if (!cleaned.has(name)) {
          cleaned.set(name, {
            name,
            county: d.Counties || "N/A",
            value: acres,
            fatalities,
            injuries
          });
        } else {
          const existing = cleaned.get(name);
          if (fatalities > existing.fatalities) {
            cleaned.set(name, {
              name,
              county: d.Counties || "N/A",
              value: acres,
              fatalities,
              injuries
            });
          }
        }
      }
    });

    const data = Array.from(cleaned.values());

    const width = 928;
    const height = 928;
    const margin = 1;

    const color = d3.scaleQuantize()
      .domain([0, 10])
      .range([
        "#00fff2", "#91eaff", "#ff91dc", "#ff2fa0", "#8e00ff"
      ]);

    const pack = d3.pack()
      .size([width - margin * 2, height - margin * 2])
      .padding(3);

    const root = pack(d3.hierarchy({ children: data }).sum(d => d.value));

    const svg = d3.select("#bubble-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height + 80)
      .attr("viewBox", [-margin, -margin, width, height + 80])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
      .attr("text-anchor", "middle");

    const node = svg.append("g")
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("fill-opacity", 0.7)
      .attr("fill", d => color(d.data.fatalities))
      .attr("stroke", d => d.data.injuries > 0 ? "#fff" : "none")
      .attr("stroke-width", d => d.data.injuries > 0 ? 2 : 0)
      .attr("r", d => d.r)
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        tooltip
          .style("display", "block")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 30) + "px")
          .html(`
            <strong>${d.data.name}</strong><br/>
            Counties : ${d.data.county}<br/>
            Deaths : ${d.data.fatalities}<br/>
            Injuries : ${d.data.injuries}
          `);
      });

    node.append("text")
      .text(d => d.data.name.length > 15 ? d.data.name.slice(0, 15) + "…" : d.data.name)
      .attr("dy", "0.35em")
      .attr("fill", "#000")
      .style("font-size", "8px")
      .style("pointer-events", "none");

    const legendWidth = 300;
    const legendHeight = 15;

    const legendScale = d3.scaleLinear()
      .domain(color.domain())
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickSize(-legendHeight);

    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "color-gradient")
      .attr("x1", "0%").attr("x2", "100%");

    const legendColors = d3.range(0, 1.01, 0.01);

    gradient.selectAll("stop")
      .data(legendColors)
      .enter().append("stop")
      .attr("offset", d => `${d * 100}%`)
      .attr("stop-color", d => color(color.domain()[0] + d * (color.domain()[1] - color.domain()[0])));

      const legendGroup = svg.append("g")
      .attr("transform", `translate(${(width - legendWidth) / 2}, ${height - 60})`);
    

    legendGroup.append("text")
      .attr("x", legendWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#00f7ff")
      .style("font-size", "12px")
      .text("Gravité humaine (nombre de morts)");

    legendGroup.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#color-gradient)");

    legendGroup.append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll("text").style("font-size", "10px"));

      // Légende du contour blanc (blessés)
      // Légende du contour blanc (blessés)
    legendGroup.append("circle")
    .attr("cx", legendWidth / 2 - 60)
    .attr("cy", legendHeight + 35)
    .attr("r", 10) // plus gros
    .attr("fill", "#000") // fond noir
    .attr("stroke", "#fff")
    .attr("stroke-width", 2);

    legendGroup.append("text")
    .attr("x", legendWidth / 2 - 42)
    .attr("y", legendHeight + 39)
    .attr("text-anchor", "start")
    .attr("fill", "#00f7ff")
    .style("font-size", "11px")
    .text("Contour blanc : blessés");

  });
})();

