import { createPortal } from "react-dom";
import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./map.web.css";
import { avatarSource } from "./common/Avatar";
const Context = createContext(null);
const latLng = (p) => [p.latitude, p.longitude];
const MapCanvas = forwardRef(function MapCanvas(
  { children, style, initialRegion, onPress },
  ref,
) {
  const element = useRef(null),
    click = useRef(onPress),
    base = useRef(null);
  click.current = onPress;
  const [map, setMap] = useState(null),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    const instance = L.map(element.current, {
      zoomControl: false,
      maxZoom: 16,
    }).setView(latLng(initialRegion), 15);
    const url = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/";
    base.current = L.tileLayer(
      url + "World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 16,
        attribution:
          "Tiles &copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors",
      },
    ).addTo(instance);
    base.current.on("tileerror", () => setFailed(true));
    base.current.on("tileload", () => setFailed(false));
    L.tileLayer(url + "World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 16,
      opacity: 0.8,
    }).addTo(instance);
    instance.on("click", (event) =>
      click.current?.({
        nativeEvent: {
          coordinate: {
            latitude: event.latlng.lat,
            longitude: event.latlng.lng,
          },
        },
      }),
    );
    L.control.zoom({ position: "bottomleft" }).addTo(instance);
    const observer = new ResizeObserver(() => instance.invalidateSize());
    observer.observe(element.current);
    setMap(instance);
    return () => {
      observer.disconnect();
      instance.remove();
    };
  }, []);
  useImperativeHandle(
    ref,
    () => ({ animateToRegion: (region) => map?.flyTo(latLng(region), 15) }),
    [map],
  );
  return (
    <View style={[style, { zIndex: 0, backgroundColor: "#111A25" }]}>
      <div
        className="clutch-map"
        ref={element}
        aria-label="Interactive squad map"
        style={{ position: "absolute", inset: 0 }}
      />
      <Context.Provider value={map}>{children}</Context.Provider>
      <View pointerEvents="none" style={s.demo}>
        <Text style={s.demoText}>REAL MAP · DEMO SQUAD</Text>
      </View>
      {failed && (
        <Pressable
          accessibilityRole="button"
          onPress={() => base.current?.redraw()}
          style={s.error}
        >
          <Text style={s.errorText}>Map tiles unavailable. Tap to retry.</Text>
        </Pressable>
      )}
    </View>
  );
});
export default MapCanvas;
export function Marker({ coordinate, title, description, pinColor, person }) {
  const map = useContext(Context),
    layer = useRef(null);
  const [portrait, setPortrait] = useState(null);
  useEffect(() => {
    if (!map) return;
    const node = document.createElement("div");
    node.className = "clutch-pin";
    node.style.setProperty("--pin", pinColor || "#c8ff00");
    if (person) {
      const slot = document.createElement("div");
      slot.style.cssText =
        "width:34px;height:34px;border-radius:50%;overflow:hidden";
      node.appendChild(slot);
      setPortrait(slot);
    } else {
      const icon = document.createElement("span");
      icon.textContent = title === "Ghost" ? "👻" : "📍";
      node.appendChild(icon);
    }
    const label = document.createElement("b");
    label.textContent = title;
    node.appendChild(label);
    const marker = L.marker(latLng(coordinate), {
      icon: L.divIcon({
        className: "clutch-marker",
        html: node,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
      title,
    }).addTo(map);
    const popup = document.createElement("div");
    popup.textContent = `${title} · ${description || ""}`;
    marker.bindPopup(popup);
    layer.current = marker;
    return () => {
      marker.remove();
      layer.current = null;
    };
  }, [map, title, person?.avatar, pinColor]);
  useEffect(() => {
    layer.current?.setLatLng(latLng(coordinate));
  }, [coordinate.latitude, coordinate.longitude]);
  return portrait && person
    ? createPortal(
        <Image
          source={avatarSource(person)}
          accessibilityLabel={title}
          style={{ width: 34, height: 34, borderRadius: 17 }}
        />,
        portrait,
      )
    : null;
}
export function Polygon({
  coordinates,
  fillColor,
  strokeColor,
  strokeWidth = 1,
}) {
  const map = useContext(Context);
  const geometry = JSON.stringify(coordinates);
  useEffect(() => {
    if (!map) return;
    const layer = L.polygon(coordinates.map(latLng), {
      color: strokeColor.slice(0, 7),
      fillColor: fillColor.slice(0, 7),
      fillOpacity: 0.18,
      weight: strokeWidth,
      opacity: 0.6,
      interactive: false,
    }).addTo(map);
    return () => layer.remove();
  }, [map, geometry, fillColor, strokeColor, strokeWidth]);
  return null;
}
export function Polyline({
  coordinates,
  strokeColor,
  strokeWidth,
  lineDashPattern,
}) {
  const map = useContext(Context);
  const geometry = JSON.stringify(coordinates),
    dash = lineDashPattern?.join(" ");
  useEffect(() => {
    if (!map) return;
    const layer = L.polyline(coordinates.map(latLng), {
      color: strokeColor,
      weight: strokeWidth,
      dashArray: dash,
      interactive: false,
    }).addTo(map);
    return () => layer.remove();
  }, [map, geometry, strokeColor, strokeWidth, dash]);
  return null;
}
const s = StyleSheet.create({
  demo: {
    position: "absolute",
    top: 65,
    right: 12,
    backgroundColor: "#05070AE8",
    padding: 6,
    borderRadius: 8,
  },
  demoText: { color: "#A5B4C7", fontSize: 8, fontWeight: "800" },
  error: {
    position: "absolute",
    bottom: 28,
    alignSelf: "center",
    backgroundColor: "#461F30",
    padding: 10,
    borderRadius: 9,
  },
  errorText: { color: "#FFE1EA", fontSize: 11 },
});
