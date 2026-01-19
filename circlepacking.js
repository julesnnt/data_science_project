(() => {
  const width = 928;
  const height = width;

  // 🎨 Palette fluo perso
  const fluoColors = ["#00f7ff", "#ff2fa0", "#8e00ff", "#ff91dc", "#91eaff", "#ff7de7", "#be29ec"];
  const color = d3.scaleOrdinal()
    .domain([0, 1, 2, 3, 4, 5, 6])
    .range(fluoColors);

  const pack = data => d3.pack()
    .size([width, height])
    .padding(3)
    (d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value));

  d3.csv("California_Fire_Incidents.csv").then(data => {
    const nested = { name: "root", children: [] };

    const yearMap = d3.group(data, d => new Date(d.Started).getFullYear());

    for (const [year, firesByYear] of yearMap.entries()) {
      const countyMap = d3.group(firesByYear, d => d.Counties || "Inconnu");

      const yearNode = {
        name: String(year),
        children: []
      };

      for (const [county, fires] of countyMap.entries()) {
        const countyNode = {
          name: county,
          children: fires
            .filter(d => d.AcresBurned > 0)
            .map(d => ({
              name: d.Name || "Inconnu",
              value: +d.AcresBurned
            }))
        };

        yearNode.children.push(countyNode);
      }

      nested.children.push(yearNode);
    }

    const root = pack(nested);

    const svg = d3.select("#circle-packing")
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", width)
      .attr("height", height)
      .style("max-width", "100%")
      .style("height", "auto")
      .style("display", "block")
      .style("margin", "0 auto")
      .style("background", "#000")
      .style("cursor", "pointer");

    let focus = root;
    let view;

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const node = g.selectAll("circle")
      .data(root.descendants().slice(1))
      .join("circle")
      .attr("fill", d => {
        if (d.depth === 0) return "#000";            // root = noir
        if (d.depth === 1) return "#00f7ff";         // années = bleu fluo
        return d.children ? color(d.depth) : "#ff2fa0"; // reste = fluo palette
      })
      
      .attr("pointer-events", d => !d.children ? "none" : null)
      .style("filter", d => {
        if (d.depth === 0) return `drop-shadow(0 0 4px #000)`;
        if (d.depth === 1) return `drop-shadow(0 0 5px #00f7ff)`;
        return d.children ? `drop-shadow(0 0 5px ${color(d.depth)})` : `drop-shadow(0 0 5px #ff2fa0)`;
      })
      
      
      .on("mouseover", function () {
        d3.select(this).attr("stroke", "#00f7ff").attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", null);
      })
      .on("click", (event, d) => {
        if (focus !== d) zoom(event, d), event.stopPropagation();
      });

      const label = g.append("g")
      .attr("font-family", "Poppins, sans-serif")
      .attr("font-size", 17)
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .style("fill", "#000") // ✅ texte en noir
      .style("fill-opacity", d => d.parent === root ? 1 : 0)
      .style("display", d => d.parent === root ? "inline" : "none")
      .text(d => d.data.name);
    
    svg.on("click", event => zoom(event, root));

    zoomTo([focus.x, focus.y, focus.r * 2]);

    function zoomTo(v) {
      const k = width / v[2];
      view = v;
      label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      node.attr("r", d => d.r * k);
    }

    function zoom(event, d) {
      focus = d;

      const transition = svg.transition()
        .duration(event.altKey ? 7500 : 750)
        .tween("zoom", () => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return t => zoomTo(i(t));
        });

      label
        .filter(function (d) {
          return d.parent === focus || this.style.display === "inline";
        })
        .transition(transition)
        .style("fill-opacity", d => d.parent === focus ? 1 : 0)
        .on("start", function (d) {
          if (d.parent === focus) this.style.display = "inline";
        })
        .on("end", function (d) {
          if (d.parent !== focus) this.style.display = "none";
        });
    }
  });
})();
