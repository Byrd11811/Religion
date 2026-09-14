import { groupCoordinates } from "../shared/exploration";
import type { MapProvider } from "./provider";

export const leafletProvider: MapProvider = {
  label: "OpenStreetMap modern base geography",
  async create(element, onSelect, onError, signal) {
    const L = await import("leaflet");
    signal.throwIfAborted();
    const map = L.map(element, { scrollWheelZoom: false }).setView([26, 25], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 17,
    })
      .on("tileerror", () =>
        onError(
          "Map tiles are unavailable. All records and their evidence remain available in the lists below.",
        ),
      )
      .addTo(map);
    const markers = L.layerGroup().addTo(map);
    return {
      update(records) {
        markers.clearLayers();
        for (const group of groupCoordinates(records)) {
          const marker = L.circleMarker([group.lat, group.lng], {
            radius: Math.min(18, 7 + Math.log2(group.records.length) * 2),
            color: "#f8e6ba",
            weight: 2,
            fillColor: "#815c2b",
            fillOpacity: 0.9,
            dashArray: group.records.every((r) => r.startDate === null)
              ? "3 3"
              : undefined,
          }).addTo(markers);
          const label = document.createElement("span");
          label.textContent = `${group.records.length} record${group.records.length === 1 ? "" : "s"} at this approximate anchor: ${group.records.map((r) => r.title).join(", ")}`;
          marker.bindTooltip(label).on("click", () => onSelect(group.records));
        }
      },
      destroy() {
        map.remove();
      },
    };
  },
};
