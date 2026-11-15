import React, { createContext, forwardRef, useContext } from "react";
import { Text as NativeText, TextInput as NativeTextInput, StyleSheet } from "react-native";

const TypographyContext = createContext({});
const weights = { 400: "400Regular", 500: "500Medium", 600: "600SemiBold", 700: "700Bold", 800: "800ExtraBold" };

function resolveTypography(style, parent) {
  const flat = StyleSheet.flatten(style) || {};
  const family = flat.fontFamily || parent.fontFamily || "Barlow_400Regular";
  const explicitWeight = flat.fontWeight === "bold" ? 700 : flat.fontWeight === "normal" ? 400 : Number(flat.fontWeight);
  const familyWeight = Number(family.match(/_(\d+)/)?.[1]) || 400;
  const weight = Math.min(800, Math.max(400, explicitWeight || familyWeight));
  const condensed = family.startsWith("BarlowCondensed");
  const resolvedFamily = condensed
    ? `BarlowCondensed_${weight >= 800 ? "800ExtraBold" : "700Bold"}`
    : `Barlow_${weights[weight] || "400Regular"}`;
  return { fontFamily: resolvedFamily, fontWeight: "normal" };
}

// Resolve real bundled weight files instead of synthetic bold, consistently on
// Android, iOS and web. Nested text keeps its parent's family unless overridden.
export const Text = forwardRef(function Text({ style, children, ...props }, ref) {
  const parent = useContext(TypographyContext);
  const typography = resolveTypography(style, parent);
  return (
    <TypographyContext.Provider value={typography}>
      <NativeText ref={ref} {...props} style={[style, typography]}>{children}</NativeText>
    </TypographyContext.Provider>
  );
});

export const TextInput = forwardRef(function TextInput({ style, ...props }, ref) {
  return <NativeTextInput ref={ref} {...props} style={[style, resolveTypography(style, {})]} />;
});
