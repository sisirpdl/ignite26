import React from "react";
import { Text, View } from "react-native";
export default function Avatar({ person, size = 40 }) {
  const fills = ["#E7EFCF", "#DAEAE4", "#E9E2F1", "#F4E3D2"];
  return (
    <View
      accessibilityLabel={`${person.name} avatar`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: fills[(person.id - 1) % 4],
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
      }}
    >
      <Text
        style={{
          color: "#30382B",
          fontFamily: "Manrope_800ExtraBold",
          fontSize: size * 0.34,
        }}
      >
        {person.name.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}
