import React, { useState } from "react";
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
import Svg, { Path, Line } from "react-native-svg";
import Brand from "../components/Brand";
import Avatar from "../components/common/Avatar";
import Card from "../components/common/Card";
import ProgressBar from "../components/common/ProgressBar";
import ScoreRing from "../components/ScoreRing";
import { bios, squad } from "../constants/data";
import { colors, type } from "../styles/theme";

const highlights = [
  [
    "01 / THE DAILY EDIT",
    "Small moves.\nBig momentum.",
    "Your squad is showing up. A little movement, a little recovery, and a little friendly competition.",
  ],
  [
    "02 / SQUAD WATCH",
    "Better,\ntogether.",
    "Head to Standings to see how everyone’s verified daily scores stack up.",
  ],
  [
    "03 / TONIGHT",
    "Rest is\npart of the plan.",
    "Tonight’s Clutch: aim for 7 hours of sleep. The whole squad is in.",
  ],
];
export default function DashboardScreen({
  metrics,
  onOpenProfile,
  onOpenGame,
  onTabChange,
}) {
  const [story, setStory] = useState(null);
  const { width } = useWindowDimensions();
  const compact = width < 370;
  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.top}>
        <Brand />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open your profile"
          onPress={() => onOpenProfile()}
        >
          <Avatar person={squad[0]} size={44} />
        </Pressable>
      </View>
      <View style={s.greeting}>
        <View>
          <Text style={s.eyebrow}>YOUR DAILY ADVANTAGE</Text>
          <Text style={s.title}>Make today count.</Text>
        </View>
        <View style={s.demo}>
          <View style={s.dot} />
          <Text style={s.demoText}>DEMO</Text>
        </View>
      </View>
      <View style={s.hero}>
        <View style={s.heroTop}>
          <Text style={s.heroEyebrow}>THE READINESS REPORT</Text>
          <Ionicons name="sparkles-outline" size={19} color={colors.lime} />
        </View>
        <View
          style={[
            s.heroMain,
            compact && { flexDirection: "column", alignItems: "flex-start" },
          ]}
        >
          <View style={s.heroCopy}>
            <Text style={s.heroTitle}>A good day{`\n`}to go further.</Text>
            <Text style={s.heroSub}>
              You’ve put in the rest.{`\n`}Now find your rhythm.
            </Text>
          </View>
          <View style={s.ring}>
            <ScoreRing
              value={metrics.recovery}
              label="Recovery"
              color={colors.lime}
              size={116}
            />
          </View>
        </View>
        <View style={s.heroFooter}>
          <View style={s.statusDot} />
          <Text style={s.heroFootText}>Ready for movement</Text>
          <Text style={s.heroFootRight}>YOUR BASELINE, YOUR PACE</Text>
        </View>
      </View>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Your daily pulse</Text>
        <Text style={s.sectionMeta}>SAMPLE HEALTH DATA</Text>
      </View>
      <View style={s.stats}>
        <View style={[s.stat, s.scoreCard]}>
          <View style={s.statTop}>
            <Ionicons name="flash-outline" size={19} color={colors.text} />
            <Text style={s.pill}>FAIR SCORE</Text>
          </View>
          <Text style={s.score}>
            {metrics.fairScore}
            <Text style={s.unit}> / 100</Text>
          </Text>
          <Text style={s.statNote}>Personal effort. Fairly measured.</Text>
          <ProgressBar
            value={metrics.fairScore}
            color={colors.text}
            height={4}
          />
        </View>
        <View style={s.stat}>
          <View style={s.statTop}>
            <Ionicons name="footsteps-outline" size={19} color={colors.text} />
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={colors.emerald}
            />
          </View>
          <Text style={s.statLabel}>Daily steps</Text>
          <Text style={s.number}>{bios.steps.toLocaleString()}</Text>
          <Text style={s.statNote}>
            Goal of {bios.stepGoal.toLocaleString()} · done
          </Text>
          <ProgressBar value={100} color={colors.accent} height={4} />
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open squad challenges"
        onPress={onOpenGame}
        style={s.challenge}
      >
        <View style={s.challengeIcon}>
          <Ionicons name="moon-outline" size={26} color={colors.text} />
        </View>
        <View style={s.challengeCopy}>
          <Text style={s.eyebrow}>TONIGHT’S CLUTCH · 10 PM</Text>
          <Text style={s.challengeTitle}>Rest up. Rise together.</Text>
          <Text style={s.statNote}>7+ hours of sleep. Everyone’s in.</Text>
        </View>
        <Ionicons name="arrow-forward" size={23} color={colors.text} />
      </Pressable>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Good company.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => onTabChange("chat")}
          style={s.link}
        >
          <Text style={s.linkText}>Open squad</Text>
          <Ionicons name="arrow-forward" size={15} color={colors.accent} />
        </Pressable>
      </View>
      <View style={s.squad}>
        {squad.map((p) => (
          <Pressable
            accessibilityRole="button"
            key={p.id}
            accessibilityLabel={`Open ${p.name} profile`}
            onPress={() => onOpenProfile(p)}
            style={s.person}
          >
            <Avatar person={p} size={49} />
            <Text style={s.personName}>{p.id === 1 ? "You" : p.name}</Text>
            <Text style={s.personRecovery}>{p.recovery}% ready</Text>
          </Pressable>
        ))}
      </View>
      <View style={s.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={onOpenGame}
          style={s.primary}
        >
          <Ionicons name="flag-outline" size={18} color="white" />
          <Text style={s.primaryText}>Start a challenge</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onTabChange("map")}
          style={s.secondary}
        >
          <Ionicons name="compass-outline" size={18} color={colors.text} />
          <Text style={s.secondaryText}>Find a route</Text>
        </Pressable>
      </View>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>The recovery edit</Text>
        <Ionicons name="leaf-outline" size={20} color={colors.accent} />
      </View>
      <Card>
        <View style={s.sleepHeading}>
          <View>
            <Text style={s.eyebrow}>LAST NIGHT’S SLEEP</Text>
            <Text style={s.sleepNumber}>
              8<Text style={s.sleepUnit}>h </Text>12
              <Text style={s.sleepUnit}>m</Text>
            </Text>
          </View>
          <View style={s.sleepBadge}>
            <Ionicons name="moon" size={15} color={colors.violet} />
            <Text style={s.sleepBadgeText}>92% efficiency</Text>
          </View>
        </View>
        <View style={s.sleepChart}>
          {Array.from({ length: 36 }, (_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: [18, 26, 39, 29, 16, 35, 44, 28, 20][i % 9],
                borderRadius: 3,
                backgroundColor: ["#B9ABD3", "#827298", "#D6CDE4"][
                  Math.floor(i / 4) % 3
                ],
              }}
            />
          ))}
        </View>
        <View style={s.sleepLegend}>
          {[
            ["Deep", "1h 38m", "#827298"],
            ["REM", "1h 52m", "#B9ABD3"],
            ["Light", "4h 42m", "#D6CDE4"],
          ].map(([a, b, c]) => (
            <View key={a} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: c }]} />
              <Text style={s.legendText}>
                {a} <Text style={s.legendValue}>{b}</Text>
              </Text>
            </View>
          ))}
        </View>
      </Card>
      <View style={s.wellbeing}>
        {[
          ["Strain", "14.2", "Moderate", "fitness-outline"],
          ["Body battery", "76", "Charged", "battery-half-outline"],
          ["Stress", "31", "Mostly calm", "leaf-outline"],
          [
            "Screen time",
            "3h 24m",
            "36m to your limit",
            "phone-portrait-outline",
          ],
          ["VO₂ max", "48.2", "Excellent", "pulse-outline"],
          ["Resting HR", "52 bpm", "Your resting rhythm", "heart-outline"],
        ].map(([label, value, note, icon]) => (
          <View key={label} style={s.wellItem}>
            <Ionicons name={icon} size={18} color={colors.muted} />
            <Text style={s.wellLabel}>{label}</Text>
            <Text style={s.wellValue}>{value}</Text>
            <Text style={s.statNote}>{note}</Text>
          </View>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="View daily spotlight"
        onPress={() => setStory(0)}
        style={s.editorial}
      >
        <View style={s.editorialCopy}>
          <Text style={s.eyebrow}>THE DAILY EDIT / 01</Text>
          <Text style={s.editorialTitle}>Small moves.{`\n`}Big momentum.</Text>
          <View style={s.link}>
            <Text style={s.linkText}>Your squad spotlight</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.accent} />
          </View>
        </View>
        <Svg width={98} height={132} viewBox="0 0 98 132">
          <Path
            d="M98 10C12 10 12 80 98 80M98 32C38 32 38 102 98 102M98 54C64 54 64 124 98 124"
            stroke="#667D3E"
            strokeWidth={10}
            fill="none"
          />
          <Line x1="0" y1="125" x2="98" y2="125" stroke="#A7B591" />
        </Svg>
      </Pressable>
      <Text style={s.endnote}>MOVE WITH PURPOSE. SHOW UP FOR EACH OTHER.</Text>
      <Modal
        visible={story !== null}
        animationType="fade"
        onRequestClose={() => setStory(null)}
      >
        <SafeAreaView style={s.storyPage}>
          <View style={s.storyHeader}>
            <Brand />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close spotlight"
              style={s.close}
              onPress={() => setStory(null)}
            >
              <Ionicons name="close" size={28} />
            </Pressable>
          </View>
          {story !== null && (
            <View style={s.storyBody}>
              <Text style={s.eyebrow}>{highlights[story][0]}</Text>
              <Text style={s.storyTitle}>{highlights[story][1]}</Text>
              <Text style={s.storySub}>{highlights[story][2]}</Text>
              <View style={s.storyDots}>
                {highlights.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      s.storyDot,
                      i === story && {
                        backgroundColor: colors.accent,
                        width: 30,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            style={s.primary}
            onPress={() => setStory(story < 2 ? story + 1 : null)}
          >
            <Text style={s.primaryText}>
              {story === 2 ? "Back to today" : "Next highlight"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </Pressable>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 22, gap: 16, paddingBottom: 28 },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  greeting: { gap: 10, marginBottom: 3 },
  eyebrow: { ...type.overline, fontSize: 9, letterSpacing: 1.3 },
  title: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 30,
    letterSpacing: -1.4,
    color: colors.text,
    marginTop: 6,
  },
  demo: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    position: "absolute",
    right: 0,
    top: -7,
  },
  dot: { height: 5, width: 5, borderRadius: 3, backgroundColor: colors.accent },
  demoText: { fontSize: 8, letterSpacing: 1, color: colors.muted },
  hero: {
    backgroundColor: colors.ink,
    borderRadius: 24,
    padding: 22,
    overflow: "hidden",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroEyebrow: {
    fontFamily: "Manrope_700Bold",
    fontSize: 9,
    letterSpacing: 1.4,
    color: "#CCD6BD",
  },
  heroMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 22,
  },
  heroCopy: { flex: 1 },
  heroTitle: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 28,
    lineHeight: 33,
    letterSpacing: -1,
    color: "#F7FAEF",
  },
  heroSub: {
    fontFamily: "Manrope_400Regular",
    fontSize: 12,
    lineHeight: 19,
    color: "#BFCBB3",
    marginTop: 10,
  },
  ring: { backgroundColor: "#303C28", borderRadius: 66, padding: 6 },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 1,
    borderColor: "#414B38",
    paddingTop: 14,
    flexWrap: "wrap",
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.lime,
  },
  heroFootText: {
    color: "#E0E9D5",
    fontSize: 10,
    fontFamily: "Manrope_600SemiBold",
  },
  heroFootRight: {
    color: "#A5B198",
    fontSize: 7,
    letterSpacing: 0.6,
    marginLeft: "auto",
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 19,
    letterSpacing: -0.6,
    color: colors.text,
  },
  sectionMeta: { fontSize: 7, letterSpacing: 1, color: colors.dim },
  stats: { flexDirection: "row", gap: 10 },
  stat: {
    flex: 1,
    padding: 17,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 8,
  },
  scoreCard: { backgroundColor: colors.lime, borderColor: colors.lime },
  statTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pill: { fontFamily: "Manrope_800ExtraBold", fontSize: 8, letterSpacing: 0.5 },
  score: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 43,
    letterSpacing: -2,
    color: colors.text,
  },
  unit: { fontSize: 12, letterSpacing: 0, color: "#526334" },
  statNote: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    fontFamily: "Manrope_500Medium",
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
  },
  number: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 27,
    letterSpacing: -1,
    color: colors.text,
  },
  challenge: {
    padding: 17,
    borderRadius: 20,
    backgroundColor: "#EAEDE0",
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  challengeIcon: {
    width: 42,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  challengeCopy: { flex: 1 },
  challengeTitle: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 15,
    color: colors.text,
    marginVertical: 4,
  },
  link: { flexDirection: "row", gap: 6, alignItems: "center", minHeight: 44 },
  linkText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 11,
    color: colors.accent,
  },
  squad: { flexDirection: "row", paddingVertical: 6 },
  person: { flex: 1, alignItems: "center", gap: 6 },
  personName: {
    fontFamily: "Manrope_700Bold",
    fontSize: 11,
    color: colors.text,
  },
  personRecovery: { fontSize: 9, color: colors.muted },
  actions: { flexDirection: "row", gap: 10 },
  primary: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  primaryText: {
    color: "#F8FAF3",
    fontFamily: "Manrope_700Bold",
    fontSize: 11,
  },
  secondary: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: colors.text,
  },
  sleepHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sleepNumber: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 34,
    letterSpacing: -1,
    color: colors.text,
    marginTop: 8,
  },
  sleepUnit: { fontSize: 20, color: colors.muted },
  sleepBadge: {
    flexDirection: "row",
    gap: 5,
    backgroundColor: "#F0EBF6",
    padding: 8,
    borderRadius: 10,
  },
  sleepBadgeText: {
    color: colors.violet,
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
  },
  sleepChart: {
    flexDirection: "row",
    gap: 3,
    height: 55,
    alignItems: "flex-end",
    marginVertical: 12,
  },
  sleepLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  legendItem: { flexDirection: "row", gap: 4, alignItems: "center" },
  legendDot: { height: 6, width: 6, borderRadius: 3 },
  legendText: { color: colors.muted, fontSize: 8 },
  legendValue: { color: colors.text, fontFamily: "Manrope_700Bold" },
  wellbeing: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  wellItem: {
    width: "48%",
    flexGrow: 1,
    padding: 17,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    gap: 5,
  },
  wellLabel: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 11,
    color: colors.muted,
    marginTop: 5,
  },
  wellValue: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 23,
    color: colors.text,
    letterSpacing: -0.7,
  },
  editorial: {
    flexDirection: "row",
    backgroundColor: "#E0E7D1",
    borderRadius: 20,
    padding: 22,
    overflow: "hidden",
    alignItems: "center",
    marginTop: 5,
  },
  editorialCopy: { flex: 1 },
  editorialTitle: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 27,
    lineHeight: 31,
    letterSpacing: -1,
    color: colors.text,
    marginTop: 12,
  },
  endnote: {
    fontSize: 8,
    letterSpacing: 1.3,
    color: colors.dim,
    textAlign: "center",
    marginTop: 8,
  },
  storyPage: { flex: 1, padding: 26, backgroundColor: "#E5ECD8" },
  storyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  close: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  storyBody: { flex: 12, justifyContent: "center" },
  storyTitle: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 48,
    letterSpacing: -2,
    lineHeight: 54,
    color: colors.text,
    marginVertical: 24,
  },
  storySub: { ...type.body, lineHeight: 24 },
  storyDots: { flexDirection: "row", gap: 6, marginTop: 30 },
  storyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C2CDB1",
  },
});
