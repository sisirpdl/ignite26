import React, { useState, useId } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import Avatar from "../components/common/Avatar";
import ScoreRing from "../components/ScoreRing";
import ProgressBar from "../components/common/ProgressBar";
import Card from "../components/common/Card";
import { squad, monthlyScores } from "../constants/data";
import { useBackendStatus, useBackendState } from "../data/BackendProvider";
import { colors, type } from "../styles/theme";

function Glow({ children, style, from = "#172740", to = "#0D1421" }) {
  const gradientId = "panel" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <View style={[s.glow, style]}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
      {children}
    </View>
  );
}
const storyData = {
  daily: [
    [
      "☀️",
      "DAILY RECAP",
      "Your squad.\nOn the rise.",
      "The board is alive. Every verified effort moves you forward.",
    ],
    [
      "🔥",
      "STREAK CHECK",
      "Nine days.\nNo excuses.",
      "Your step streak is growing. Keep showing up.",
    ],
  ],
  weekly: [
    [
      "🏆",
      "WEEKLY RECAP",
      "Chase progress.\nBring your people.",
      "Recovery, movement and a little friendly rivalry. That’s a good week.",
    ],
    [
      "🌙",
      "NEXT UP",
      "Tonight,\nsleep wins.",
      "Seven hours. Four friends. One shared Clutch.",
    ],
  ],
};
export default function DashboardScreen({
  metrics,
  onOpenProfile,
  onTabChange,
  onOpenGame,
}) {
  const [story, setStory] = useState(null);
  const [seen, setSeen] = useState({});
  const backend = useBackendStatus();
  const [runs] = useBackendState("runs", []);
  const [game] = useBackendState("game", {});
  const { width } = useWindowDimensions();
  const openStory = (kind) => {
    setSeen((all) => ({ ...all, [kind]: true }));
    setStory({ kind, index: 0 });
  };
  const rank =
    [...squad]
      .sort(
        (a, b) =>
          monthlyScores[b.id].reduce((x, y) => x + y) -
          monthlyScores[a.id].reduce((x, y) => x + y),
      )
      .findIndex((p) => p.id === 1) + 1;
  const points = monthlyScores[1].reduce((a, b) => a + b, 0);
  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.brandRow}>
        <Text style={s.brand}>
          clutch<Text style={{ color: colors.lime }}>⚡</Text>
        </Text>
        <View style={s.season}>
          <View style={s.liveDot} />
          <Text style={s.seasonText}>SEASON 01 · DEMO</Text>
        </View>
      </View>
      <View style={s.storyRow}>
        <View style={s.storyLinks}>
          {[
            ["daily", "☀️", "Daily", colors.lime],
            ["weekly", "🏆", "Weekly", colors.violet],
          ].map(([key, emoji, label, color]) => (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={`${label} story`}
              onPress={() => openStory(key)}
              style={s.storyLink}
            >
              <View
                style={[
                  s.storyCircle,
                  { borderColor: seen[key] ? colors.border : color },
                ]}
              >
                <Text style={s.storyEmoji}>{emoji}</Text>
              </View>
              <Text style={s.storyCaption}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open group profile"
          onPress={() => onOpenProfile()}
          style={s.group}
        >
          <Text style={s.groupName}>⚡ The Squad</Text>
          <Text style={s.groupPoints}>{points.toLocaleString()} pts</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open your profile"
          onPress={() => onOpenProfile()}
          style={s.storyLink}
        >
          <Avatar person={squad[0]} size={44} />
          <Text style={s.storyCaption}>Profile</Text>
        </Pressable>
      </View>
      <Glow from="#26351B" to="#0D1720" style={s.clutchCard}>
        <View style={s.between}>
          <Text style={[s.kicker, { color: colors.lime }]}>
            ⚡ TONIGHT’S CLUTCH
          </Text>
          <Text style={s.everyone}>EVERYONE’S IN</Text>
        </View>
        <View style={s.clutchBody}>
          <View style={s.moon}>
            <Text style={{ fontSize: 30 }}>🌙</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.clutchTitle}>Sleep 7h+ tonight</Text>
            <Text style={s.muted}>
              {game.clutch === "live"
                ? "Live until 8 AM · Rest now. Win tomorrow."
                : game.clutch === "settled"
                  ? "Challenge complete · 3/4 passed"
                  : "Starts 10 PM · Rest now. Win tomorrow."}
            </Text>
          </View>
        </View>
        <View style={s.between}>
          <View style={s.avatarStack}>
            {squad.map((p) => (
              <View key={p.id} style={{ marginRight: -7 }}>
                <Avatar person={p} size={27} />
              </View>
            ))}
            <Text style={s.squadJoined}>4/4 ready</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => onOpenGame("clutch")}
            style={s.outlineButton}
          >
            <Text style={s.limeText}>View challenge</Text>
            <Ionicons name="arrow-forward" color={colors.lime} size={14} />
          </Pressable>
        </View>
      </Glow>
      <View style={s.section}>
        <Text style={s.sectionTitle}>Your daily stats</Text>
        <Text style={s.sample}>SAMPLE HEALTH DATA</Text>
      </View>
      <Glow from="#112C2A" to="#101925">
        <View style={s.between}>
          <Text style={s.kicker}>TODAY’S READINESS</Text>
          <View style={s.positive}>
            <Ionicons name="trending-up" color={colors.emerald} size={13} />
            <Text style={s.positiveText}>IN THE GREEN</Text>
          </View>
        </View>
        <View style={[s.readiness, width < 350 && { gap: 10 }]}>
          <ScoreRing
            value={metrics.recovery}
            label="Recovery"
            color={colors.emerald}
            size={width < 350 ? 110 : 128}
          />
          <View style={{ flex: 1 }}>
            <Text style={s.readyTitle}>Primed to{`\n`}perform.</Text>
            <Text style={s.readySub}>
              Recovered. Recharged.{`\n`}Go make your move.
            </Text>
            <View style={s.vitals}>
              <Text style={s.vital}>
                HRV <Text style={s.vitalValue}>74</Text>
              </Text>
              <Text style={s.vital}>
                RHR <Text style={s.vitalValue}>52</Text>
              </Text>
            </View>
          </View>
        </View>
      </Glow>
      <View style={s.scoreStrip}>
        <View>
          <Text style={s.kicker}>DAILY FAIR SCORE</Text>
          <Text style={s.fairScore}>
            {metrics.fairScore}
            <Text style={s.hundred}> / 100</Text>
          </Text>
        </View>
        <View style={{ flex: 1, marginHorizontal: 18 }}>
          <Text style={s.personalBest}>Built on your baseline</Text>
          <ProgressBar
            value={metrics.fairScore}
            color={colors.cyan}
            height={6}
          />
          <Text style={s.scoreNote}>HRV · sleep · heart rate · steps</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View challenge standings"
          onPress={() => onTabChange("leaderboard")}
          style={s.rank}
        >
          <Text style={s.rankNumber}>#{rank}</Text>
          <Text style={s.rankLabel}>SQUAD</Text>
        </Pressable>
      </View>
      <View style={s.metricRow}>
        <Mini
          emoji="👟"
          label="STEPS"
          value="10,420"
          sub="10,000 goal crushed"
          color={colors.lime}
          progress={100}
        />
        <Mini
          emoji="🔥"
          label="STRAIN"
          value="14.2"
          sub="Moderate intensity"
          color={colors.orange}
          progress={68}
        />
      </View>
      <View style={s.streakStrip}>
        {[
          ["😴", "5", "SLEEP"],
          ["🌙", "3", "CURFEW"],
          ["👟", "9", "STEP GOAL"],
        ].map(([emoji, n, label]) => (
          <View key={label} style={s.streak}>
            <Text style={{ fontSize: 20 }}>{emoji}</Text>
            <View>
              <Text style={s.streakNumber}>
                {n}
                <Text style={s.streakDays}> days 🔥</Text>
              </Text>
              <Text style={s.streakLabel}>{label}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={s.section}>
        <Text style={s.sectionTitle}>Enter the arena</Text>
        <Text style={s.sample}>MAKE IT PERSONAL</Text>
      </View>
      <View style={s.arenaRow}>
        <Arena
          emoji="⚔️"
          title="1v1 Duel"
          text="Call out your rival"
          color={colors.rose}
          onPress={() => onOpenGame("duels")}
        />
        <Arena
          emoji="📵"
          title="Phone Down"
          text="Log off. Level up."
          color={colors.violet}
          onPress={() => onOpenGame("clutch")}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open squad feed"
        onPress={() => onTabChange("chat")}
      >
        <Glow from="#1C1835" to="#101722">
          <View style={s.between}>
            <Text style={[s.kicker, { color: colors.violet }]}>
              💬 SQUAD CHECK-IN
            </Text>
            <Ionicons name="arrow-forward" color={colors.violet} size={18} />
          </View>
          <Text style={s.feedTitle}>The group chat has legs.</Text>
          <Text style={s.muted}>Trail run at 6? Your people are waiting.</Text>
          <View style={[s.avatarStack, { marginTop: 12 }]}>
            {squad.slice(1).map((p) => (
              <View key={p.id} style={{ marginRight: -6 }}>
                <Avatar person={p} size={27} />
              </View>
            ))}
            <Text style={[s.squadJoined, { color: colors.violet }]}>
              Polls, snaps & a little trash talk
            </Text>
          </View>
        </Glow>
      </Pressable>
      <View style={s.section}>
        <Text style={s.sectionTitle}>Recovery is a flex.</Text>
        <Text style={s.sample}>LAST NIGHT</Text>
      </View>
      <Card
        title="😴 SLEEP BREAKDOWN"
        action={
          <Text
            style={{ color: colors.violet, fontSize: 10, fontWeight: "800" }}
          >
            92% EFFICIENCY
          </Text>
        }
      >
        <Text style={s.sleepValue}>
          8h <Text style={{ color: colors.violet }}>12m</Text>
        </Text>
        <View style={s.sleepChart}>
          {Array.from({ length: 32 }, (_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: [20, 34, 46, 28, 39, 18, 30, 44][i % 8],
                borderRadius: 3,
                backgroundColor: ["#6366F1", "#A78BFA", "#38BDF8"][
                  Math.floor(i / 4) % 3
                ],
              }}
            />
          ))}
        </View>
        <View style={s.between}>
          {[
            ["Deep", "98m", "#6366F1"],
            ["REM", "112m", "#A78BFA"],
            ["Light", "282m", "#38BDF8"],
          ].map(([label, value, color]) => (
            <Text key={label} style={s.sleepLegend}>
              <Text style={{ color }}>● </Text>
              {label} <Text style={{ color: "white" }}>{value}</Text>
            </Text>
          ))}
        </View>
      </Card>
      <View style={s.metricRow}>
        <Mini
          emoji="🔋"
          label="BODY BATTERY"
          value="76"
          sub="Charged and ready"
          color={colors.cyan}
          progress={76}
        />
        <Mini
          emoji="🧘"
          label="STRESS"
          value="31"
          sub="Mostly calm"
          color={colors.emerald}
          progress={31}
        />
      </View>
      <View style={s.metricRow}>
        <Mini
          emoji="📱"
          label="SCREEN TIME"
          value="3h 24m"
          sub="36m left in your limit"
          color={colors.amber}
          progress={85}
        />
        <Mini
          emoji="🫀"
          label="VO₂ MAX"
          value="48.2"
          sub="Excellent · trending up"
          color={colors.violet}
          progress={80}
        />
      </View>
      <Pressable accessibilityRole="button" onPress={() => onTabChange("map")}>
        <Glow from="#12364A" to="#101725">
          <View style={s.between}>
            <View>
              <Text style={[s.kicker, { color: colors.cyan }]}>
                🗺️ OWN YOUR TURF
              </Text>
              <Text style={s.feedTitle}>
                Race the ghost.{`\n`}Leave your mark.
              </Text>
              <Text style={s.muted}>
                {runs.length
                  ? `${runs.length} ${runs.length === 1 ? "run" : "runs"} saved to your backend`
                  : "3 routes · Squad territory · Ghost races"}
              </Text>
            </View>
            <Ionicons name="navigate-circle" size={58} color={colors.cyan} />
          </View>
        </Glow>
      </Pressable>
      <View accessibilityRole="text" style={s.backend}>
        <View
          style={[
            s.liveDot,
            { backgroundColor: backend.error ? colors.rose : colors.emerald },
          ]}
        />
        <Text style={[s.backendText, backend.error && { color: colors.rose }]}>
          {backend.error || backend.status}
        </Text>
      </View>
      <Modal
        visible={!!story}
        animationType="fade"
        onRequestClose={() => setStory(null)}
      >
        <SafeAreaView style={s.storyPage}>
          {story && (
            <>
              <View style={s.storyProgress}>
                {storyData[story.kind].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      s.storyTrack,
                      i <= story.index && { backgroundColor: colors.lime },
                    ]}
                  />
                ))}
              </View>
              <View style={s.between}>
                <Text style={s.brand}>clutch⚡</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close story"
                  onPress={() => setStory(null)}
                  style={s.close}
                >
                  <Ionicons name="close" color="white" size={28} />
                </Pressable>
              </View>
              <View style={s.storyMain}>
                <Text style={{ fontSize: 85 }}>
                  {storyData[story.kind][story.index][0]}
                </Text>
                <Text style={[s.kicker, { color: colors.lime, marginTop: 28 }]}>
                  {storyData[story.kind][story.index][1]}
                </Text>
                <Text style={s.storyTitle}>
                  {storyData[story.kind][story.index][2]}
                </Text>
                <Text style={s.storyDescription}>
                  {storyData[story.kind][story.index][3]}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setStory(
                    story.index + 1 < storyData[story.kind].length
                      ? { ...story, index: story.index + 1 }
                      : null,
                  )
                }
                style={s.storyNext}
              >
                <Text style={{ fontWeight: "900" }}>Next highlight →</Text>
              </Pressable>
            </>
          )}
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}
function Mini({ emoji, label, value, sub, color, progress }) {
  return (
    <View style={s.mini}>
      <View style={s.between}>
        <Text style={{ fontSize: 19 }}>{emoji}</Text>
        <Text style={[s.miniLabel, { color }]}>{label}</Text>
      </View>
      <Text style={s.miniValue}>{value}</Text>
      <Text style={s.muted}>{sub}</Text>
      <View style={{ marginTop: 12 }}>
        <ProgressBar value={progress} color={color} height={5} />
      </View>
    </View>
  );
}
function Arena({ emoji, title, text, color, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        s.arena,
        { borderColor: color + "55", backgroundColor: color + "10" },
      ]}
    >
      <View style={s.between}>
        <Text style={{ fontSize: 26 }}>{emoji}</Text>
        <Ionicons name="arrow-up-right-box-outline" size={17} color={color} />
      </View>
      <Text style={s.arenaTitle}>{title}</Text>
      <Text style={s.muted}>{text}</Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 13, paddingBottom: 22 },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    color: "white",
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 25,
    letterSpacing: -1.2,
  },
  season: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#101725",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 4,
    backgroundColor: colors.lime,
  },
  seasonText: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  storyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  storyLinks: { flexDirection: "row", gap: 12 },
  storyLink: { alignItems: "center", gap: 5 },
  storyCircle: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  storyEmoji: { fontSize: 23 },
  storyCaption: { color: "#D2DEEA", fontSize: 9, fontWeight: "800" },
  group: { alignItems: "center", gap: 7 },
  groupName: { color: "white", fontSize: 12, fontWeight: "900" },
  groupPoints: {
    color: colors.lime,
    fontSize: 11,
    fontWeight: "900",
    backgroundColor: "#1D2B16",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  glow: {
    padding: 17,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#25354B",
    overflow: "hidden",
  },
  clutchCard: { borderColor: "#586C2D" },
  between: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
  },
  kicker: { ...type.overline, fontSize: 9, letterSpacing: 1.4 },
  everyone: { color: colors.lime, fontSize: 8, fontWeight: "800" },
  clutchBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 17,
  },
  moon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#2D3522",
    alignItems: "center",
    justifyContent: "center",
  },
  clutchTitle: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 18,
    color: "white",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  muted: { fontSize: 10, color: colors.muted, lineHeight: 15 },
  avatarStack: { flexDirection: "row", alignItems: "center" },
  squadJoined: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "700",
    marginLeft: 13,
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minHeight: 44,
  },
  limeText: { color: colors.lime, fontSize: 10, fontWeight: "800" },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 7,
  },
  sectionTitle: {
    color: "white",
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 17,
    letterSpacing: -0.4,
  },
  sample: {
    fontSize: 7,
    color: colors.dim,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  positive: { flexDirection: "row", gap: 4, alignItems: "center" },
  positiveText: { color: colors.emerald, fontSize: 8, fontWeight: "900" },
  readiness: {
    flexDirection: "row",
    gap: 20,
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 4,
  },
  readyTitle: {
    fontFamily: "Manrope_800ExtraBold",
    color: "white",
    fontSize: 25,
    lineHeight: 28,
    letterSpacing: -0.8,
  },
  readySub: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 7 },
  vitals: { flexDirection: "row", gap: 12, marginTop: 10 },
  vital: { color: colors.dim, fontSize: 9 },
  vitalValue: { color: "white", fontWeight: "900", fontSize: 12 },
  scoreStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fairScore: {
    color: colors.cyan,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1,
  },
  hundred: { fontSize: 12, color: colors.dim },
  personalBest: { fontSize: 9, color: "#C4D8E6", marginBottom: 8 },
  scoreNote: { color: colors.dim, fontSize: 7, marginTop: 6 },
  rank: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#202B16",
    padding: 10,
    borderRadius: 12,
  },
  rankNumber: { fontSize: 19, fontWeight: "900", color: colors.lime },
  rankLabel: { fontSize: 7, fontWeight: "900", color: colors.lime },
  metricRow: { flexDirection: "row", gap: 11 },
  mini: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 20,
  },
  miniLabel: { fontSize: 8, letterSpacing: 0.6, fontWeight: "900" },
  miniValue: {
    color: "white",
    fontSize: 24,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: -0.8,
    marginTop: 9,
    marginBottom: 3,
  },
  streakStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#442C22",
    backgroundColor: "#1A1311",
    padding: 13,
  },
  streak: { flexDirection: "row", gap: 6, alignItems: "center" },
  streakNumber: { color: "#FED7AA", fontSize: 14, fontWeight: "900" },
  streakDays: { fontSize: 8 },
  streakLabel: {
    color: "#B1886C",
    fontSize: 7,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  arenaRow: { flexDirection: "row", gap: 11 },
  arena: { flex: 1, padding: 15, borderRadius: 20, borderWidth: 1 },
  arenaTitle: {
    color: "white",
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 16,
    marginTop: 11,
    marginBottom: 4,
  },
  feedTitle: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.6,
    color: "white",
    marginTop: 10,
    marginBottom: 5,
  },
  sleepValue: { color: "white", fontSize: 31, fontWeight: "900" },
  sleepChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: 55,
    marginVertical: 13,
  },
  sleepLegend: { fontSize: 10, color: colors.muted },
  backend: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    padding: 8,
  },
  backendText: { color: colors.dim, fontSize: 10, flexShrink: 1 },
  storyPage: { flex: 1, padding: 22, backgroundColor: "#111B30" },
  storyProgress: { flexDirection: "row", gap: 5, marginBottom: 18 },
  storyTrack: {
    height: 3,
    backgroundColor: "#324157",
    flex: 1,
    borderRadius: 2,
  },
  close: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  storyMain: { flex: 1, justifyContent: "center", alignItems: "center" },
  storyTitle: {
    color: "white",
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 34,
    lineHeight: 39,
    textAlign: "center",
    marginTop: 17,
    letterSpacing: -1,
  },
  storyDescription: {
    fontSize: 14,
    lineHeight: 23,
    color: colors.muted,
    textAlign: "center",
    marginTop: 18,
  },
  storyNext: {
    backgroundColor: colors.lime,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 18,
  },
});
