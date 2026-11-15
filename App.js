import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import BackendProvider, { useBackendState } from "./src/data/BackendProvider";
import {
  useFonts,
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
  Barlow_700Bold,
  Barlow_800ExtraBold,
} from "@expo-google-fonts/barlow";
import { BarlowCondensed_700Bold, BarlowCondensed_800ExtraBold } from "@expo-google-fonts/barlow-condensed";
import ClutchApp from "./src/ClutchApp";

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    BarlowCondensed_700Bold,
    BarlowCondensed_800ExtraBold,
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
    Barlow_800ExtraBold,
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
