(() => {
  // Canvas 08 — global daisy globe with temporal evolution.
  // Aesthetic: Cable Globe interaction model + website fuchsia / daisy white-yellow palette.
  const container = document.getElementById("daisy-globe");
  if (!container || typeof maplibregl === "undefined") return;

  const yearSlider = document.getElementById("daisy-year-slider");
  const yearLabel = document.getElementById("daisy-selected-year");
  const yearCount = document.getElementById("daisy-year-count");
  const statusEl = document.getElementById("daisy-globe-status");
  const detailTitle = document.getElementById("daisy-globe-detail-title");
  const detailBody = document.getElementById("daisy-globe-detail-body");

  const wireframeStyle = {
    version: 8,
    projection: { type: "globe" },
    sources: {},
    layers: [
      {
        id: "space",
        type: "background",
        paint: { "background-color": "#050008" }
      }
    ],
    sky: {
      "sky-color": "#120018",
      "horizon-color": "#ffb0e8",
      "fog-color": "#1a0520",
      "sky-horizon-blend": 0.12,
      "horizon-fog-blend": 0.08,
      "fog-ground-blend": 0.42,
      "atmosphere-blend": 0.16
    }
  };

  const map = new maplibregl.Map({
    container: "daisy-globe",
    style: wireframeStyle,
    center: [12, 28],
    zoom: 1.25,
    minZoom: 0.6,
    maxZoom: 7.5,
    attributionControl: false
  });

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true, showCompass: false }), "bottom-right");
  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");

  let interacting = false;
  let interactionTimer = null;
  let popup = null;
  let allFeatures = [];

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function setDetail(title, body) {
    if (detailTitle) detailTitle.textContent = title;
    if (detailBody) detailBody.innerHTML = body;
  }

  function yearFilter(year) {
    return ["<=", ["get", "year"], year];
  }

  function applyYear() {
    if (!yearSlider) return;
    const year = Number(yearSlider.value);
    const filter = yearFilter(year);
    ["daisy-heat", "daisy-halo", "daisy-points"].forEach((id) => {
      if (map.getLayer(id)) map.setFilter(id, filter);
    });
    if (yearLabel) yearLabel.textContent = String(year);
    const visible = allFeatures.filter((f) => f.properties.year <= year).length;
    if (yearCount) yearCount.textContent = `${visible} blooms`;
  }

  map.on("load", async () => {
    try {
      setStatus("Loading globe layers…");

      const [countriesRes, bloomRes] = await Promise.all([
        fetch("data/countries-110m.geojson"),
        fetch("data/bellis-perennis-global.geojson")
      ]);
      if (!countriesRes.ok) throw new Error(`countries HTTP ${countriesRes.status}`);
      if (!bloomRes.ok) throw new Error(`occurrences HTTP ${bloomRes.status}`);

      const countries = await countriesRes.json();
      const bloom = await bloomRes.json();
      allFeatures = bloom.features || [];

      const years = allFeatures.map((f) => Number(f.properties.year)).filter(Boolean);
      const minYear = years.length ? Math.min(...years) : 1890;
      const maxYear = years.length ? Math.max(...years) : 2026;

      if (yearSlider) {
        yearSlider.min = String(minYear);
        yearSlider.max = String(maxYear);
        yearSlider.value = String(maxYear);
      }

      map.addSource("countries", { type: "geojson", data: countries });
      map.addLayer({
        id: "countries-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": "#14001a",
          "fill-opacity": 0.78
        }
      });
      map.addLayer({
        id: "countries-line",
        type: "line",
        source: "countries",
        paint: {
          "line-color": "rgba(255, 154, 223, 0.34)",
          "line-width": [
            "interpolate", ["linear"], ["zoom"],
            0, 0.35,
            4, 0.85
          ],
          "line-opacity": 0.9
        }
      });

      map.addSource("daisies", { type: "geojson", data: bloom });

      map.addLayer({
        id: "daisy-heat",
        type: "heatmap",
        source: "daisies",
        maxzoom: 5.5,
        paint: {
          "heatmap-weight": 0.9,
          "heatmap-intensity": [
            "interpolate", ["linear"], ["zoom"],
            0, 0.45,
            4, 1.15
          ],
          "heatmap-radius": [
            "interpolate", ["linear"], ["zoom"],
            0, 10,
            4, 26
          ],
          "heatmap-opacity": [
            "interpolate", ["linear"], ["zoom"],
            0, 0.75,
            5, 0.12
          ],
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(5,0,8,0)",
            0.15, "rgba(255, 214, 64, 0.18)",
            0.4, "rgba(255, 176, 232, 0.45)",
            0.7, "rgba(255, 154, 223, 0.75)",
            1, "rgba(255, 255, 255, 0.95)"
          ]
        }
      });

      map.addLayer({
        id: "daisy-halo",
        type: "circle",
        source: "daisies",
        paint: {
          "circle-color": "#fff7c2",
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            0, 2.2,
            4, 6.5
          ],
          "circle-opacity": 0.16,
          "circle-blur": 0.85
        }
      });

      map.addLayer({
        id: "daisy-points",
        type: "circle",
        source: "daisies",
        paint: {
          "circle-color": [
            "interpolate", ["linear"], ["get", "year"],
            minYear, "#7a4dff",
            1980, "#ffb0e8",
            2005, "#ffd640",
            maxYear, "#ffffff"
          ],
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            0, 1.35,
            3, 2.6,
            6, 4.4
          ],
          "circle-stroke-color": "rgba(255, 154, 223, 0.75)",
          "circle-stroke-width": 0.6,
          "circle-opacity": 0.92
        }
      });

      applyYear();
      setStatus(`${allFeatures.length} global records · taxon 5WH44`);
      setDetail(
        "GLOBAL DAISY FIELD",
        "Drag the year slider to watch <em>Bellis perennis</em> observations accumulate across the planet — a living archive of where daisies have been noticed over time."
      );

      map.on("mouseenter", "daisy-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "daisy-points", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "daisy-points", (event) => {
        const feature = event.features[0];
        const props = feature.properties || {};
        const html = `
          <p class="bloom-popup-kicker">DAISY RECORD</p>
          <strong>${props.name || "Bellis perennis"}</strong>
          <p>${props.region || props.country || "Unknown"} · ${props.year || "—"}</p>
          <p class="bloom-popup-meta">${props.basis || "GBIF occurrence"}</p>
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
          String(props.year || "YEAR"),
          `${props.name || "Bellis perennis"} in ${props.region || props.country || "unknown place"}.<br><br><span class="network-meta">${props.basis || "GBIF"}</span>`
        );
      });
    } catch (error) {
      console.error(error);
      setStatus(`Cannot load globe data (${error.message}).`);
    }
  });

  if (yearSlider) {
    yearSlider.addEventListener("input", applyYear);
  }

  map.on("mousedown", () => { interacting = true; });
  map.on("touchstart", () => { interacting = true; });
  map.on("mouseup", () => { interacting = false; });
  map.on("touchend", () => { interacting = false; });
  map.getCanvas().addEventListener("wheel", () => {
    interacting = true;
    clearTimeout(interactionTimer);
    interactionTimer = setTimeout(() => { interacting = false; }, 700);
  }, { passive: true });
  map.on("zoomstart", () => { interacting = true; });
  map.on("zoomend", () => {
    clearTimeout(interactionTimer);
    interactionTimer = setTimeout(() => { interacting = false; }, 350);
  });

  function spin() {
    if (!interacting && map.getZoom() < 4.2) {
      const center = map.getCenter();
      center.lng -= 0.012 / Math.max(1, map.getZoom());
      map.setCenter(center);
    }
    requestAnimationFrame(spin);
  }
  map.once("idle", spin);

  const resizeObserver = new ResizeObserver(() => map.resize());
  resizeObserver.observe(container);
})();
