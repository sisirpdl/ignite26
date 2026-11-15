import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../styles/theme";
export default function Brand() {
  return (
    <View style={s.row}>
      <Svg
        width={30}
        height={30}
        viewBox="0 0 40 40"
        accessibilityLabel="Clutch"
      >
        <Path
          d="M12 4H34L27 14H17L9 26L3 19Z M19 17H29L22 27H35L28 37H10L5 30Z"
          fill={colors.text}
        />
      </Svg>
      <Text style={s.name}>
        clutch<Text style={s.period}>.</Text>
      </Text>
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, alignItems: "center" },
  name: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 28,
    letterSpacing: -1.8,
    color: colors.text,
  },
  period: { color: colors.accent },
});
