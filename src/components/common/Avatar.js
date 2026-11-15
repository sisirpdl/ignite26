import React, { useState } from "react";
import { Image, Text, View } from "react-native";
const portraits = {
  Kai: require("../../../assets/avatars/kai.png"),
  Nova: require("../../../assets/avatars/nova.png"),
  Rio: require("../../../assets/avatars/rio.png"),
  Zane: require("../../../assets/avatars/zane.png"),
};
export const avatarSource = (person) => portraits[person.avatar];
export default function Avatar({ person, size = 40 }) {
  const [failed, setFailed] = useState(false);
  return (
    <View
      accessibilityLabel={`${person.name} avatar`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        backgroundColor: person.color,
        borderWidth: 2,
        borderColor: person.color,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {failed || !avatarSource(person) ? (
        <Text
          style={{ fontSize: size * 0.42, fontWeight: "900", color: "#030508" }}
        >
          {person.name[0]}
        </Text>
      ) : (
        <Image
          source={avatarSource(person)}
          onError={() => setFailed(true)}
          style={{ width: size, height: size }}
          accessibilityLabel={`${person.name} character`}
        />
      )}
    </View>
  );
}
