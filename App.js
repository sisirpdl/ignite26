import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import ClutchApp from "./src/ClutchApp";

const STORAGE_KEY = "@clutch-native/preferences";

export default function App() {
  const [saved, setSaved] = useState(null);
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => setSaved(value ? JSON.parse(value) : {}))
      .catch(() => setSaved({}));
  }, []);

  const persist = (preferences) => {
    setSaved(preferences);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)).catch(
      () => {},
    );
  };

  if (!saved || !fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <ClutchApp preferences={saved} onPreferencesChange={persist} />
    </SafeAreaProvider>
  );
}
