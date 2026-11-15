import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/theme";
const tabs = [
  ["dashboard", "Today", "sunny-outline"],
  ["leaderboard", "Standings", "podium-outline"],
  ["chat", "Squad", "chatbubbles-outline"],
  ["map", "Explore", "compass-outline"],
];
export default function BottomTabs({ active, onChange, unread }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.wrap, { paddingBottom: Math.max(12, insets.bottom) }]}>
      {tabs.map(([key, label, icon]) => (
        <Pressable
          key={key}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === key }}
          accessibilityLabel={label}
          onPress={() => onChange(key)}
          style={s.tab}
        >
          <View style={[s.icon, active === key && s.selected]}>
            <Ionicons
              name={icon}
              size={23}
              color={active === key ? colors.text : colors.dim}
            />
            {key === "chat" && unread > 0 && <View style={s.badge} />}
          </View>
          <Text style={[s.label, active === key && s.labelOn]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    paddingTop: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  tab: { flex: 1, alignItems: "center", minHeight: 52, gap: 4 },
  icon: {
    width: 52,
    height: 30,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: { backgroundColor: colors.lime },
  label: { fontFamily: "Manrope_600SemiBold", fontSize: 10, color: colors.dim },
  labelOn: { color: colors.text, fontFamily: "Manrope_800ExtraBold" },
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
