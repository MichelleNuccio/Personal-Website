(() => {
  // Relational Structures diagram: Bellis perennis inside its pollination ecosystem.
  const svg = d3.select("#flower-network");
  const detailTitle = d3.select("#network-detail-title");
  const detailBody = d3.select("#network-detail-body");
  if (svg.empty()) return;

  const nodes = [
    {
      id: "daisy",
      label: "Bellis perennis",
      short: "DAISY",
      group: "organism",
      detail: "The daisy sits at the center of this relational web: a living interface between soil, sunlight, pollinators, and human attention."
    },
    {
      id: "honeybee",
      label: "Honeybee",
      short: "BEE",
      group: "pollinator",
      detail: "Honeybees visit daisy heads for nectar and pollen, transferring grains between flowers as they forage."
    },
    {
      id: "solitary",
      label: "Solitary bee",
      short: "SOLITARY",
      group: "pollinator",
      detail: "Solitary bees often carry pollen on their legs or abdomen, making them especially effective pollinators of open composites like daisies."
    },
    {
      id: "hoverfly",
      label: "Hoverfly",
      short: "HOVERFLY",
      group: "pollinator",
      detail: "Hoverflies mimic bees and feed on nectar; their visits help move pollen while they scan the meadow for prey and bloom."
    },
    {
      id: "butterfly",
      label: "Butterfly",
      short: "BUTTERFLY",
      group: "pollinator",
      detail: "Butterflies sip nectar with a long proboscis, lightly brushing florets and linking distant flower patches through flight."
    },
    {
      id: "nectar",
      label: "Nectar",
      short: "NECTAR",
      group: "resource",
      detail: "Sugary nectar is the flower's invitation: energy for insects, and the lure that makes pollination possible."
    },
    {
      id: "pollen",
      label: "Pollen",
      short: "POLLEN",
      group: "resource",
      detail: "Pollen carries the plant's genetic material. When moved between flowers, it enables fertilization and seed set."
    },
    {
      id: "seeds",
      label: "Seeds",
      short: "SEEDS",
      group: "outcome",
      detail: "Successful pollination ripens into seeds that restart the daisy cycle across seasons and meadows."
    },
    {
      id: "soil",
      label: "Soil & microbes",
      short: "SOIL",
      group: "environment",
      detail: "Soil structure and microbial life feed the roots, anchoring the daisy in a living underground network."
    },
    {
      id: "sun",
      label: "Sunlight",
      short: "SUN",
      group: "environment",
      detail: "Sunlight powers photosynthesis, shaping bloom timing and the intensity of the daisy's seasonal presence."
    },
    {
      id: "water",
      label: "Rain & dew",
      short: "WATER",
      group: "environment",
      detail: "Moisture keeps petals turgid and nectar flowing; drought tightens the whole relational chain."
    },
    {
      id: "meadow",
      label: "Meadow habitat",
      short: "MEADOW",
      group: "place",
      detail: "The meadow is the shared stage: grasses, edges, and open soil where daisy, insects, and weather meet."
    },
    {
      id: "human",
      label: "Human care",
      short: "HUMAN",
      group: "social",
      detail: "Gardeners, walkers, and observers protect, plant, or simply notice the daisy — extending kindness into the ecosystem."
    }
  ];

  const links = [
    { source: "honeybee", target: "daisy", relation: "pollinates" },
    { source: "solitary", target: "daisy", relation: "pollinates" },
    { source: "hoverfly", target: "daisy", relation: "pollinates" },
    { source: "butterfly", target: "daisy", relation: "visits" },
    { source: "daisy", target: "nectar", relation: "offers" },
    { source: "daisy", target: "pollen", relation: "produces" },
    { source: "honeybee", target: "nectar", relation: "collects" },
    { source: "honeybee", target: "pollen", relation: "collects" },
    { source: "solitary", target: "pollen", relation: "transports" },
    { source: "hoverfly", target: "nectar", relation: "feeds on" },
    { source: "butterfly", target: "nectar", relation: "feeds on" },
    { source: "pollen", target: "seeds", relation: "enables" },
    { source: "daisy", target: "seeds", relation: "forms" },
    { source: "soil", target: "daisy", relation: "nourishes" },
    { source: "sun", target: "daisy", relation: "energizes" },
    { source: "water", target: "daisy", relation: "hydrates" },
    { source: "meadow", target: "daisy", relation: "shelters" },
    { source: "meadow", target: "honeybee", relation: "hosts" },
    { source: "meadow", target: "hoverfly", relation: "hosts" },
    { source: "seeds", target: "meadow", relation: "reseed" },
    { source: "human", target: "daisy", relation: "tends / notices" },
    { source: "human", target: "meadow", relation: "protects" }
  ];

  const groupMeta = {
    organism: { fill: "#ff9adf", stroke: "#ffd0f5", glow: "rgba(255, 154, 223, 0.95)" },
    pollinator: { fill: "#20e7ff", stroke: "#9af6ff", glow: "rgba(32, 231, 255, 0.85)" },
    resource: { fill: "#ffb0e8", stroke: "#ffd1f4", glow: "rgba(255, 176, 232, 0.8)" },
    outcome: { fill: "#ff7ad4", stroke: "#ffb4f2", glow: "rgba(255, 53, 220, 0.85)" },
    environment: { fill: "#7a4dff", stroke: "#c9b6ff", glow: "rgba(122, 77, 255, 0.8)" },
    place: { fill: "#06ccc6", stroke: "#9af7f3", glow: "rgba(6, 204, 198, 0.8)" },
    social: { fill: "#ff8ee8", stroke: "#ffd1f4", glow: "rgba(255, 106, 213, 0.85)" }
  };

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  let selectedId = "daisy";
  let simulation;
  let width = 0;
  let height = 0;
  let paintGraph = () => {};

  const defs = svg.append("defs");
  const glow = defs.append("filter")
    .attr("id", "networkGlow")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");
  glow.append("feGaussianBlur").attr("stdDeviation", "2.4").attr("result", "coloredBlur");
  const merge = glow.append("feMerge");
  merge.append("feMergeNode").attr("in", "coloredBlur");
  merge.append("feMergeNode").attr("in", "SourceGraphic");

  const root = svg.append("g").attr("class", "network-root");
  const linkLayer = root.append("g").attr("class", "network-links");
  const labelLayer = root.append("g").attr("class", "network-link-labels");
  const nodeLayer = root.append("g").attr("class", "network-nodes");

  function setDetail(node) {
    selectedId = node.id;
    detailTitle.text(node.label.toUpperCase());
    detailBody.html(
      `${node.detail}<br><br><span class="network-meta">${node.group.toUpperCase()}</span>`
    );
    nodeLayer.selectAll("g.network-node").classed("is-active", (d) => d.id === selectedId);
  }

  function drag() {
    function dragstarted(event, d) {
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
      d.x = event.x;
      d.y = event.y;
      paintGraph();
    }
    function dragended(event, d) {
      d.fx = d.x;
      d.fy = d.y;
    }
    return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
  }

  // Stretch the settled layout so nodes fill nearly the whole panel.
  function fitNodesToViewport(graphNodes, padX, padY) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const d of graphNodes) {
      minX = Math.min(minX, d.x);
      minY = Math.min(minY, d.y);
      maxX = Math.max(maxX, d.x);
      maxY = Math.max(maxY, d.y);
    }

    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);
    const targetW = width - padX * 2;
    const targetH = height - padY * 2;
    const scale = Math.min(targetW / spanX, targetH / spanY);

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    for (const d of graphNodes) {
      d.x = width / 2 + (d.x - midX) * scale;
      d.y = height / 2 + (d.y - midY) * scale;
      if (d.fx != null) d.fx = d.x;
      if (d.fy != null) d.fy = d.y;
    }
  }

  function render() {
    const bounds = svg.node().getBoundingClientRect();
    width = Math.max(360, bounds.width);
    height = Math.max(460, bounds.height || 520);
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const graphNodes = nodes.map((d) => ({ ...d }));
    const graphLinks = links.map((d) => ({ ...d }));
    const span = Math.min(width, height);
    const linkDistance = Math.max(110, span * 0.22);
    const charge = -Math.max(520, span * 1.35);
    const collideBase = Math.max(28, span * 0.045);
    let fitted = false;

    if (simulation) simulation.stop();

    simulation = d3.forceSimulation(graphNodes)
      .force("link", d3.forceLink(graphLinks).id((d) => d.id).distance(linkDistance).strength(0.55))
      .force("charge", d3.forceManyBody().strength(charge))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d) => (d.group === "organism" ? collideBase + 12 : collideBase)))
      .force("x", d3.forceX(width / 2).strength(0.02))
      .force("y", d3.forceY(height / 2).strength(0.02))
      .alphaDecay(0.028);

    const link = linkLayer.selectAll("line")
      .data(graphLinks, (d) => `${d.source.id || d.source}-${d.target.id || d.target}-${d.relation}`)
      .join("line")
      .attr("class", "network-link");

    const linkLabel = labelLayer.selectAll("text")
      .data(graphLinks, (d) => `${d.source.id || d.source}-${d.target.id || d.target}-${d.relation}`)
      .join("text")
      .attr("class", "network-link-label")
      .text((d) => d.relation);

    const node = nodeLayer.selectAll("g.network-node")
      .data(graphNodes, (d) => d.id)
      .join((enter) => {
        const g = enter.append("g")
          .attr("class", "network-node")
          .call(drag())
          .on("click", (_, d) => setDetail(d))
          .on("mouseenter", (_, d) => setDetail(d));

        g.append("circle").attr("class", "network-node-halo");
        g.append("circle").attr("class", "network-node-core");
        g.append("text")
          .attr("class", "network-node-label")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em");
        return g;
      });

    const haloR = Math.max(22, span * 0.032);
    const coreR = Math.max(14, span * 0.022);

    node.classed("is-active", (d) => d.id === selectedId);
    node.select("circle.network-node-halo")
      .attr("r", (d) => (d.group === "organism" ? haloR + 8 : haloR))
      .attr("fill", (d) => groupMeta[d.group].fill)
      .attr("opacity", 0.18);
    node.select("circle.network-node-core")
      .attr("r", (d) => (d.group === "organism" ? coreR + 5 : coreR))
      .attr("fill", (d) => groupMeta[d.group].fill)
      .attr("stroke", (d) => groupMeta[d.group].stroke)
      .attr("filter", "url(#networkGlow)");
    node.select("text.network-node-label")
      .attr("y", (d) => (d.group === "organism" ? coreR + 22 : coreR + 18))
      .text((d) => d.short);

    function paint() {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      linkLabel
        .attr("x", (d) => (d.source.x + d.target.x) / 2)
        .attr("y", (d) => (d.source.y + d.target.y) / 2);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    }

    paintGraph = paint;

    simulation.on("tick", () => {
      // Expand once near rest, then freeze so forces do not shrink it again.
      if (!fitted && simulation.alpha() < 0.09) {
        fitNodesToViewport(graphNodes, 56, 64);
        fitted = true;
        simulation.stop();
      }
      paint();
    });

    simulation.on("end", () => {
      if (!fitted) {
        fitNodesToViewport(graphNodes, 56, 64);
        fitted = true;
      }
      paint();
    });

    setDetail(nodeById.get(selectedId) || nodes[0]);
  }

  render();
  window.addEventListener("resize", () => {
    selectedId = selectedId || "daisy";
    render();
  });
})();
