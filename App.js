import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import BackendProvider, { useBackendState } from "./src/data/BackendProvider";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import ClutchApp from "./src/ClutchApp";

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  if (!fontsLoaded && !fontError) return null;
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <BackendProvider>
        <ConnectedApp />
      </BackendProvider>
    </SafeAreaProvider>
  );
}
function ConnectedApp() {
  const [preferences, setPreferences] = useBackendState("preferences", {});
  return (
    <ClutchApp preferences={preferences} onPreferencesChange={setPreferences} />
  );
}
