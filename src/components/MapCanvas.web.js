import React, { forwardRef, useImperativeHandle, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, {
  Path,
  Polygon as SvgPolygon,
  Polyline as SvgPolyline,
  Circle,
  Text as SvgText,
} from "react-native-svg";
const center = { latitude: 44.0132, longitude: -97.1112 };
const point = (p) => [
  (p.longitude - center.longitude) * 26000 + 200,
  200 - (p.latitude - center.latitude) * 31000,
];
// A clearly labeled browser-only route schematic. iOS/Android use real native maps.
const MapCanvas = forwardRef(function MapCanvas(
  { children, style, onPress },
  ref,
) {
  const [size, setSize] = useState({ width: 400, height: 400 });
  useImperativeHandle(ref, () => ({ animateToRegion: () => {} }));
  return (
    <View
      style={[style, { backgroundColor: "#101E31" }]}
      onLayout={(e) => setSize(e.nativeEvent.layout)}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
        onPress={(e) => {
          const x = (e.nativeEvent.locationX / size.width) * 400;
          const y = (e.nativeEvent.locationY / size.height) * 400;
          onPress?.({
            nativeEvent: {
              coordinate: {
                latitude: center.latitude + (200 - y) / 31000,
                longitude: center.longitude + (x - 200) / 26000,
              },
            },
          });
        }}
      >
        <Path
          d="M-10 270 Q100 150 150 215T420 110"
          stroke="#173B51"
          strokeWidth={42}
          fill="none"
        />
        {[30, 110, 190, 270, 350].map((x) => (
          <Path
            key={x}
            d={`M${x} 0L${x + 40} 400 M0 ${x}L400 ${x + 40}`}
            stroke="#283C55"
            strokeWidth={12}
          />
        ))}
        <Path
          d="M0 320Q140 260 400 300M70 0Q160 130 360 400"
          stroke="#38516E"
          strokeWidth={3}
          fill="none"
        />
        <SvgText x={18} y={75} fill="#91A7C4" fontSize={10}>
          RIVERSIDE PARK
        </SvgText>
        <SvgText x={258} y={330} fill="#91A7C4" fontSize={10}>
          THE NEIGHBORHOOD
        </SvgText>
        {children}
      </Svg>
      <Text style={s.note}>ROUTE SCHEMATIC · DEMO</Text>
    </View>
  );
});
export default MapCanvas;
export function Marker({ coordinate, title, pinColor }) {
  const [x, y] = point(coordinate);
  return (
    <>
      <Circle
        cx={x}
        cy={y}
        r={9}
        fill={pinColor}
        stroke="white"
        strokeWidth={3}
      />
      <SvgText
        x={x}
        y={y - 14}
        textAnchor="middle"
        fontSize={9}
        fontWeight="bold"
        fill="#293924"
      >
        {title}
      </SvgText>
    </>
  );
}
export function Polygon({ coordinates, fillColor, strokeColor }) {
  return (
    <SvgPolygon
      points={coordinates.map((p) => point(p).join(",")).join(" ")}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={1}
    />
  );
}
export function Polyline({ coordinates, strokeColor, strokeWidth }) {
  return (
    <SvgPolyline
      points={coordinates.map((p) => point(p).join(",")).join(" ")}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
const s = StyleSheet.create({
  note: {
    position: "absolute",
    bottom: 7,
    right: 12,
    fontSize: 8,
    color: "#94A3B8",
    backgroundColor: "#0B1423",
    padding: 5,
    borderRadius: 5,
  },
});
