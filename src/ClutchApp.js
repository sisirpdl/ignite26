import { useBackendStatus } from "./data/BackendProvider";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomTabs from "./components/BottomTabs";
import DashboardScreen from "./screens/DashboardScreen";
import LeaderboardScreen from "./screens/LeaderboardScreen";
import ChatScreen from "./screens/ChatScreen";
import MapScreen from "./screens/MapScreen";
import ProfileScreen from "./screens/ProfileScreen";
import GameModal from "./components/GameModal";
import { ME, squad } from "./constants/data";
import { dailyMetrics } from "./utils/metrics";
import { colors } from "./styles/theme";

export default function ClutchApp({ preferences, onPreferencesChange }) {
  const [tab, setTab] = useState("dashboard");
  const [visited, setVisited] = useState(["dashboard"]);
  const [profile, setProfile] = useState(null);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState("");
  const [gameOpen, setGameOpen] = useState(false);
  const metrics = dailyMetrics();
  const backend = useBackendStatus();
  const [gameTab, setGameTab] = useState("duels");
  const openGame = (pool = "duels") => {
    setGameTab(pool);
    setGameOpen(true);
  };
  const openProfile = (person = squad.find((member) => member.id === ME)) =>
    setProfile(person);
  const flash = (message) => {
    setToast(message);
  };
  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(id);
  }, [toast]);
  const changeTab = (nextTab) => {
    setTab(nextTab);
    setVisited((all) => (all.includes(nextTab) ? all : [...all, nextTab]));
    if (nextTab === "chat") setUnread(0);
  };
  const safePreferences = { group: "g1", ...preferences };
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.app}>
        <View style={styles.content}>
          {visited.includes("dashboard") && (
            <View style={[styles.screen, tab !== "dashboard" && styles.hidden]}>
              <DashboardScreen
                metrics={metrics}
                onOpenProfile={openProfile}
                onTabChange={changeTab}
                onOpenGame={openGame}
                onToast={flash}
              />
            </View>
          )}
          {visited.includes("leaderboard") && (
            <View
              style={[styles.screen, tab !== "leaderboard" && styles.hidden]}
            >
              <LeaderboardScreen onProfile={openProfile} />
            </View>
          )}
          {visited.includes("chat") && (
            <View style={[styles.screen, tab !== "chat" && styles.hidden]}>
              <ChatScreen
                onUnread={(count) => setUnread(tab === "chat" ? 0 : count)}
                onProfile={openProfile}
                onOpenGame={openGame}
                onToast={flash}
              />
            </View>
          )}
          {visited.includes("map") && (
            <View style={[styles.screen, tab !== "map" && styles.hidden]}>
              <MapScreen onToast={flash} />
            </View>
          )}
        </View>
        <Text
          accessibilityLiveRegion="polite"
          style={{
            textAlign: "center",
            color: backend.error ? colors.rose : colors.dim,
            fontSize: 9,
            padding: 4,
          }}
        >
          {backend.error || backend.status}
        </Text>
        <BottomTabs active={tab} onChange={changeTab} unread={unread} />
        {toast ? (
          <View pointerEvents="none" style={styles.toast}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        ) : null}
        <ProfileScreen
          visible={Boolean(profile)}
          person={profile}
          onClose={() => setProfile(null)}
          preferences={safePreferences}
          onPreferencesChange={onPreferencesChange}
          onDuel={() => openGame("duels")}
          onToast={flash}
        />
        <GameModal
          initialPool={gameTab}
          visible={gameOpen}
          onClose={() => setGameOpen(false)}
          onToast={flash}
        />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  app: {
    flex: 1,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    backgroundColor: colors.bg,
  },
  content: { flex: 1 },
  screen: { flex: 1 },
  hidden: { display: "none" },
  toast: {
    position: "absolute",
    bottom: 86,
    alignSelf: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 22,
    paddingVertical: 11,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  toastText: { color: "#030508", fontSize: 12, fontWeight: "900" },
});
