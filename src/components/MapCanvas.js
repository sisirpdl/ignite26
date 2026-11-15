import { Text } from "./common/Typography";
import React from "react";
import { View } from "react-native";
import NativeMap, { Marker as NativeMarker } from "react-native-maps";
import Avatar from "./common/Avatar";
export default NativeMap;
export { Polygon, Polyline } from "react-native-maps";
export function Marker({ person, ...props }) {
  return (
    <NativeMarker {...props}>
      {person ? (
        <View style={{ alignItems: "center", padding: 4 }}>
          <Avatar person={person} size={40} />
          <Text
            style={{
              fontSize: 9,
              fontWeight: "800",
              color: "white",
              backgroundColor: "#05070ADE",
              paddingHorizontal: 5,
              borderRadius: 5,
            }}
          >
            {props.title}
          </Text>
        </View>
      ) : null}
    </NativeMarker>
  );
}
