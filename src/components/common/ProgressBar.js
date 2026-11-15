import React from "react";
import { StyleSheet, View } from "react-native";
import { clamp } from "../../utils/format";

export default function ProgressBar({ value, color = "#22d3ee", height = 8 }) {
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamp(value)}%`,
            backgroundColor: color,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  track: {
    overflow: "hidden",
    backgroundColor: "#1C293B",
    borderWidth: 1,
    borderColor: "#1C293B",
  },
  fill: { height: "100%" },
});
