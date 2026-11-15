import { Text } from "./common/Typography";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../styles/theme";

export default function ScoreRing({
  value,
  label,
  color = colors.cyan,
  size = 148,
}) {
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1E3040"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.min(value, 100) / 100)}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  svg: { position: "absolute" },
  center: { alignItems: "center" },
  value: { fontFamily: "BarlowCondensed_800ExtraBold", fontSize: 36, fontWeight: "900", fontVariant: ["tabular-nums"] },
  label: {
    color: "#B6C9DC",
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: "800",
    textTransform: "uppercase",
    marginTop: 2,
  },
});
