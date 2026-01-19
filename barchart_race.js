(async () => {
  const width = 700;
  const barSize = 36;
  const margin = { top: 16, right: 6, bottom: 6, left: 80 };
  const n = 12;
  const duration = 1200;
  const height = margin.top + barSize * n + margin.bottom;

  const formatNumber = d3.format(",d");

  const svg = d3.select("#bar-chart-race").append("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("font", "12px 'Poppins', sans-serif")
    .style("background", "#000");

  const raw = await d3.csv("California_Fire_Incidents.csv");

  const data = raw
    .filter(d => d.Started && d.AcresBurned && d.Counties)
    .map(d => ({
      name: d.Counties.split(",")[0].trim(),
      date: new Date(d.Started).getFullYear(),
      value: +d.AcresBurned
    }))
    .filter(d =>
      !isNaN(d.date) &&
      !isNaN(d.value) &&
      d.value > 0 &&
      d.date >= 2013 && d.date <= 2023
    );
    
  const grouped = Array.from(
    d3.rollup(data,
      v => d3.sum(v, d => d.value),
      d => d.date,
      d => d.name
    ),
    ([date, values]) => [new Date(date, 0, 1), Array.from(values, ([name, value]) => ({ name, value }))]
  ).sort((a, b) => d3.ascending(a[0], b[0]));

  const names = new Set(data.map(d => d.name));

  const rank = value => {
    const data = Array.from(names, name => {
      const v = value(name);
      return { name, value: v, rank: 0 };
    }).filter(d => d.value > 0);

    data.sort((a, b) => d3.descending(a.value, b.value));
    for (let i = 0; i < data.length; ++i)
      data[i].rank = Math.min(n, i);
    return data;
  };

  const k = 10;
  const keyframes = [];

  for (let i = 0; i < grouped.length - 1; ++i) {
    const [ka, a] = grouped[i];
    const [kb, b] = grouped[i + 1];
    for (let j = 0; j < k; ++j) {
      const t = j / k;
      const date = new Date(ka * (1 - t) + kb * t);
      const frame = rank(name => {
        const va = a.find(d => d.name === name)?.value || 0;
        const vb = b.find(d => d.name === name)?.value || 0;
        return va * (1 - t) + vb * t;
      });
      keyframes.push([date, frame]);
    }
  }

  keyframes.push([grouped.at(-1)[0], rank(name =>
    grouped.at(-1)[1].find(d => d.name === name)?.value || 0
  )]);

  const nameframes = d3.groups(keyframes.flatMap(([date, data]) =>
    data.map(d => [d.name, d])
  ), d => d[0]);

  const prev = new Map(nameframes.flatMap(([, data]) =>
    d3.pairs(data, (a, b) => [b, a])
  ));
  const next = new Map(nameframes.flatMap(([, data]) =>
    d3.pairs(data)
  ));

  const x = d3.scaleLinear([0, 1], [margin.left, width - margin.right]);
  const y = d3.scaleBand().domain(d3.range(n + 1)).rangeRound([margin.top, height - margin.bottom]).padding(0.1);

  
  const color = d3.scaleOrdinal()
    .domain(Array.from(names))
    .range(["#00f7ff", "#ff2fa0", "#8e00ff", "#ff91dc", "#ff7de7", "#91eaff", "#2dfcfc", "#ff58a5", "#be29ec", "#00c3ff"]);

  const axis = svg.append("g").attr("transform", `translate(0,${margin.top})`);
  const barGroup = svg.append("g");
  const labelGroup = svg.append("g");
  const ticker = svg.append("text")
    .attr("font-size", 36)
    .attr("font-family", "Poppins, sans-serif")
    .attr("font-weight", "bold")
    .attr("fill", "#00f7ff")
    .attr("text-anchor", "end")
    .attr("x", width - 6)
    .attr("y", height - 30)
    .attr("dy", "0.32em");

  async function playAnimation() {
    for (const [date, data] of keyframes) {
      x.domain([0, data[0].value]);

      axis.transition().duration(duration)
        .call(d3.axisTop(x).ticks(width / 160).tickSizeOuter(0))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll("text").attr("fill", "#00f7ff"));

      ticker.text(d3.utcFormat("%Y")(date));

      barGroup.selectAll("rect")
        .data(data.slice(0, n), d => d.name)
        .join(
          enter => enter.append("rect")
            .attr("fill", d => color(d.name))
            .attr("x", x(0))
            .attr("y", d => y((prev.get(d) || d).rank))
            .attr("height", y.bandwidth())
            .attr("width", d => x((prev.get(d) || d).value) - x(0))
            .attr("rx", 6) // arrondi
            .attr("ry", 6)
            .style("filter", d => `drop-shadow(0 0 6px ${color(d.name)})`),
          update => update,
          exit => exit.remove()
        )
        .transition().duration(duration)
        .attr("y", d => y(d.rank))
        .attr("width", d => x(d.value) - x(0));

      barGroup.selectAll("text.label")
        .data(data.slice(0, n), d => d.name)
        .join(
          enter => enter.append("text")
            .attr("class", "label")
            .attr("x", d => x(d.value * 0.01))
            .attr("y", d => y((prev.get(d) || d).rank) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("font-size", "11px")
            .attr("fill", "#fff")
            .attr("text-anchor", "start")
            .each(function(d) {
              d3.select(this)
                .text(null)
                .append("tspan")
                .attr("class", "label-name")
                .text(d.name);
              d3.select(this)
                .append("tspan")
                .attr("class", "label-value")
                .attr("dx", "0.4em")
                .text(`(${formatNumber(d.value)})`);
            }),
          update => update,
          exit => exit.remove()
        )
        .transition().duration(duration)
        .attr("y", d => y(d.rank) + y.bandwidth() / 2)
        .attr("x", d => x(d.value * 0.01))
        .tween("text", function(d) {
          const valueSpan = d3.select(this).select(".label-value");
          const i = d3.interpolateRound(
            +valueSpan.text().replace(/\D/g, ''),
            d.value
          );
          return function(t) {
            valueSpan.text(`(${formatNumber(i(t))})`);
          };
        });

      await new Promise(resolve => setTimeout(resolve, duration));
    }
  }

  playAnimation();

  document.getElementById("replay-btn").addEventListener("click", () => {
    playAnimation();
  });

})();
