import React from "react";
import { Text, View } from "react-native";
export default function Avatar({ person, size = 40 }) {
  const fills = ["#26381B", "#153B4F", "#35264F", "#493121"];
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
        borderColor: person.color,
      }}
    >
      <Text
        style={{
          color: person.color,
          fontFamily: "Manrope_800ExtraBold",
          fontSize: size * 0.34,
        }}
      >
        {person.name.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}
