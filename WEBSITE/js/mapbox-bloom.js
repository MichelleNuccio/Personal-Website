(() => {
  // Canvas 07 — geospatial MapLibre canvas (Mapbox-compatible API),
  // styled after Cable Globe and tuned to the fuchsia website language.
  const container = document.getElementById("bloom-map");
  if (!container || typeof maplibregl === "undefined") return;

  const statusEl = document.getElementById("bloom-map-status");
  const searchEl = document.getElementById("bloom-map-search");
  const resetBtn = document.getElementById("bloom-map-reset");
  const fitBtn = document.getElementById("bloom-map-fit");
  const detailTitle = document.getElementById("bloom-map-detail-title");
  const detailBody = document.getElementById("bloom-map-detail-body");

  const monthNames = ["—", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const wireframeStyle = {
    version: 8,
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {},
    layers: [
      {
        id: "space",
        type: "background",
        paint: { "background-color": "#09010f" }
      }
    ]
  };

  const map = new maplibregl.Map({
    container: "bloom-map",
    style: wireframeStyle,
    center: [12.5, 42.3],
    zoom: 5.1,
    minZoom: 3.5,
    maxZoom: 12,
    attributionControl: false
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

  let dataBounds = null;
  let popup = null;

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function setDetail(title, body) {
    if (detailTitle) detailTitle.textContent = title;
    if (detailBody) detailBody.innerHTML = body;
  }

  function monthColorExpression() {
    // Spring peak (Mar–May) blooms hottest fuchsia; winter stays cooler cyan-violet.
    return [
      "match",
      ["coalesce", ["get", "month"], 0],
      1, "#7a4dff",
      2, "#c45cff",
      3, "#ff7ad4",
      4, "#ffb0e8",
      5, "#ff9adf",
      6, "#20e7ff",
      7, "#06ccc6",
      8, "#06ccc6",
      9, "#7a4dff",
      10, "#7a4dff",
      11, "#5a3dff",
      12, "#5a3dff",
      "#ffb0e8"
    ];
  }

  map.on("load", async () => {
    try {
      setStatus("Loading GeoJSON…");

      const [countriesRes, bloomRes] = await Promise.all([
        fetch("data/countries-110m.geojson"),
        fetch("data/bellis-perennis-it.geojson")
      ]);

      if (!countriesRes.ok) throw new Error(`countries HTTP ${countriesRes.status}`);
      if (!bloomRes.ok) throw new Error(`occurrences HTTP ${bloomRes.status}`);

      const countries = await countriesRes.json();
      const bloom = await bloomRes.json();

      map.addSource("countries", { type: "geojson", data: countries });
      map.addLayer({
        id: "countries-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": "#1a0520",
          "fill-opacity": 0.55
        }
      });
      map.addLayer({
        id: "countries-line",
        type: "line",
        source: "countries",
        paint: {
          "line-color": "rgba(255, 154, 223, 0.28)",
          "line-width": [
            "interpolate", ["linear"], ["zoom"],
            3, 0.4,
            8, 1.1
          ],
          "line-opacity": 0.9
        }
      });

      map.addSource("bellis", { type: "geojson", data: bloom });

      map.addLayer({
        id: "bellis-heat",
        type: "heatmap",
        source: "bellis",
        maxzoom: 9,
        paint: {
          "heatmap-weight": 0.85,
          "heatmap-intensity": [
            "interpolate", ["linear"], ["zoom"],
            4, 0.55,
            8, 1.35
          ],
          "heatmap-radius": [
            "interpolate", ["linear"], ["zoom"],
            4, 14,
            8, 28
          ],
          "heatmap-opacity": [
            "interpolate", ["linear"], ["zoom"],
            5, 0.72,
            9, 0.08
          ],
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(9,1,15,0)",
            0.2, "rgba(122,77,255,0.25)",
            0.45, "rgba(255,154,223,0.45)",
            0.7, "rgba(255,176,232,0.7)",
            1, "rgba(32,231,255,0.95)"
          ]
        }
      });

      map.addLayer({
        id: "bellis-halo",
        type: "circle",
        source: "bellis",
        paint: {
          "circle-color": monthColorExpression(),
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            4, 4.5,
            8, 10,
            11, 14
          ],
          "circle-opacity": 0.16,
          "circle-blur": 0.75
        }
      });

      map.addLayer({
        id: "bellis-points",
        type: "circle",
        source: "bellis",
        paint: {
          "circle-color": monthColorExpression(),
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            4, 2.2,
            8, 4.4,
            11, 6.2
          ],
          "circle-stroke-color": "rgba(255, 209, 244, 0.85)",
          "circle-stroke-width": 0.7,
          "circle-opacity": 0.92
        }
      });

      dataBounds = new maplibregl.LngLatBounds();
      bloom.features.forEach((feature) => {
        dataBounds.extend(feature.geometry.coordinates);
      });
      map.fitBounds(dataBounds, { padding: 56, duration: 900, maxZoom: 6.4 });

      setStatus(`${bloom.features.length} GBIF records · Italy · taxon 5WH44`);
      setDetail(
        "BELLIS PERENNIS",
        "Occurrence points from <a href=\"https://www.gbif.org/taxon/5WH44\" target=\"_blank\" rel=\"noopener\">GBIF taxon 5WH44</a>. Color encodes month of observation — spring peaks glow hottest."
      );

      map.on("mouseenter", "bellis-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "bellis-points", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "bellis-points", (event) => {
        const feature = event.features[0];
        const props = feature.properties || {};
        const month = Number(props.month) || 0;
        const html = `
          <p class="bloom-popup-kicker">OCCURRENCE</p>
          <strong>${props.name || "Bellis perennis"}</strong>
          <p>${props.region || "Italy"} · ${monthNames[month] || "—"} ${props.year || ""}</p>
          <p class="bloom-popup-meta">${props.basis || "record"} · ${props.dataset || "GBIF"}</p>
        `;

        if (popup) popup.remove();
        popup = new maplibregl.Popup({
          closeButton: true,
          offset: 14,
          className: "bloom-map-popup"
        })
          .setLngLat(feature.geometry.coordinates)
          .setHTML(html)
          .addTo(map);

        setDetail(
          (props.region || "ITALY").toString().toUpperCase(),
          `${props.name || "Bellis perennis"} observed in ${monthNames[month] || "unknown month"} ${props.year || ""}.<br><br><span class="network-meta">${props.basis || "GBIF RECORD"}</span>`
        );
      });
    } catch (error) {
      console.error(error);
      setStatus(`Cannot load GeoJSON (${error.message}). Use the local server.`);
    }
  });

  const pointLayers = ["bellis-points", "bellis-halo", "bellis-heat"];

  if (searchEl) {
    searchEl.addEventListener("input", () => {
      const term = searchEl.value.trim().toLowerCase();
      const filter = term
        ? ["in", term, ["downcase", ["coalesce", ["get", "region"], ""]]]
        : null;
      pointLayers.forEach((id) => {
        if (map.getLayer(id)) map.setFilter(id, filter);
      });
      setStatus(term ? `Filter: “${term}”` : "Showing all loaded records");
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (!searchEl) return;
      searchEl.value = "";
      searchEl.dispatchEvent(new Event("input"));
      setStatus("Filters cleared");
    });
  }

  if (fitBtn) {
    fitBtn.addEventListener("click", () => {
      if (dataBounds) map.fitBounds(dataBounds, { padding: 56, duration: 700, maxZoom: 6.4 });
    });
  }

  // Keep map sized when the panel layout settles.
  const resizeObserver = new ResizeObserver(() => map.resize());
  resizeObserver.observe(container);
})();
