import { Text } from "./Typography";
import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, type } from "../../styles/theme";

export default function Card({ title, action, children, style }) {
  return (
    <View style={[styles.card, style]}>
      {(title || action) && (
        <View style={styles.header}>
          <Text style={type.overline}>{title}</Text>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
});
