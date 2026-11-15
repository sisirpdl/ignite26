import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/theme";
const tabs = [
  ["dashboard", "Daily", "pulse-outline"],
  ["leaderboard", "Challenge", "podium-outline"],
  ["chat", "Group Feed", "chatbubbles-outline"],
  ["map", "Maps", "map-outline"],
];
export default function BottomTabs({ active, onChange, unread }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingBottom: Math.max(10, insets.bottom), paddingTop: 5 }}>
      <View style={s.wrap}>
        {tabs.map(([key, label, icon]) => (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active === key }}
            accessibilityLabel={label}
            onPress={() => onChange(key)}
            style={[s.tab, active === key && s.selected]}
          >
            <View style={s.icon}>
              <Ionicons
                name={icon}
                size={23}
                color={active === key ? colors.cyan : colors.dim}
              />
              {key === "chat" && unread > 0 && <View style={s.badge} />}
            </View>
            <Text style={[s.label, active === key && s.labelOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    paddingTop: 6,
    paddingBottom: 6,
    marginHorizontal: 12,
    borderRadius: 26,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#0B111D",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    minHeight: 56,
    gap: 4,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  icon: {
    width: 52,
    height: 30,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: {
    backgroundColor: "#123144",
    borderWidth: 1,
    borderColor: "#21566B",
  },
  label: { fontFamily: "Manrope_600SemiBold", fontSize: 10, color: colors.dim },
  labelOn: { color: colors.cyan, fontFamily: "Manrope_800ExtraBold" },
  badge: {
    position: "absolute",
    right: 9,
    top: 3,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.rose,
  },
});
