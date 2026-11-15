import { Text } from "./Typography";
import React from "react";
import { Modal, Pressable, StyleSheet, View, ScrollView } from "react-native";
import { colors } from "../../styles/theme";

export default function ModalSheet({ visible, title, children, onClose }) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityRole="button"
        style={styles.backdrop}
        onPress={onClose}
      >
        <Pressable
          accessibilityRole="button"
          style={styles.sheet}
          onPress={() => {}}
        >
          <View style={styles.handle} />
          <View style={styles.heading}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              accessibilityRole="button"
              style={{
                minWidth: 44,
                minHeight: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
              accessibilityLabel="Close sheet"
              onPress={onClose}
            >
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,.7)",
  },
  sheet: {
    maxHeight: "88%",
    backgroundColor: colors.surfaceStrong,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 34,
    borderWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    width: 42,
    height: 4,
    alignSelf: "center",
    borderRadius: 4,
    backgroundColor: "#475569",
    marginBottom: 16,
  },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { color: colors.text, fontWeight: "900", fontSize: 17 },
  close: { color: colors.muted, fontSize: 30, lineHeight: 28 },
});
