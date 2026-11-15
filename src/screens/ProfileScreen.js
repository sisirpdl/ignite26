import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Avatar from "../components/common/Avatar";
import Card from "../components/common/Card";
import ProgressBar from "../components/common/ProgressBar";
import { ME, squad, monthlyScores } from "../constants/data";
import { colors, type } from "../styles/theme";

const badges = [
  ["😴", "Sleep Streak", 5, 7],
  ["🌙", "Night Owl Reformed", 3, 7],
  ["👟", "Step Machine", 9, 10],
  ["⚡", "Clutch King", 1, 3],
  ["⚔️", "Duelist", 0, 1],
  ["📵", "Iron Will", 0, 1],
];

export default function ProfileScreen({
  visible,
  onClose,
  person,
  preferences,
  onPreferencesChange,
  onDuel,
  onToast,
}) {
  if (!person) return null;
  const mine = person.id === ME;
  const standings = squad
    .map((p) => ({
      id: p.id,
      total: monthlyScores[p.id].reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => b.total - a.total);
  const rank = standings.findIndex((p) => p.id === person.id) + 1;
  const points = standings.find((p) => p.id === person.id)?.total || 0;
  const setGroup = (group) => onPreferencesChange({ ...preferences, group });
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.page}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onClose}
            style={styles.back}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {mine ? "Profile & Settings" : person.name}
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {mine && (
            <>
              <Text style={type.overline}>YOUR GROUPS</Text>
              <View style={styles.groups}>
                {[
                  ["g1", "⚡", "The Squad", "4 members"],
                  ["g2", "🌅", "Morning Runners", "7 members"],
                ].map(([id, icon, name, count]) => (
                  <Pressable
                    accessibilityRole="button"
                    key={id}
                    onPress={() => setGroup(id)}
                    style={[
                      styles.group,
                      preferences.group === id && styles.groupSelected,
                    ]}
                  >
                    <Text style={styles.groupIcon}>{icon}</Text>
                    <Text style={styles.groupName}>{name}</Text>
                    <Text style={styles.groupCount}>{count}</Text>
                    {preferences.group === id && (
                      <Text style={styles.check}>✓</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </>
          )}
          <Card>
            <View style={styles.profile}>
              <Avatar person={person} size={62} />
              <View style={styles.profileCopy}>
                <Text style={styles.name}>
                  {mine ? "Shishir" : person.name}
                </Text>
                <Text style={styles.groupText}>
                  ⚡{" "}
                  {preferences.group === "g2" ? "Morning Runners" : "The Squad"}
                </Text>
              </View>
              <View>
                <Text style={styles.points}>{points.toLocaleString()}</Text>
                <Text style={styles.pointsLabel}>CHALLENGE PTS</Text>
              </View>
            </View>
            <View style={styles.profileMetrics}>
              <ProfileMetric
                label="RANK"
                value={`#${rank} of ${squad.length}`}
              />
              <ProfileMetric label="TODAY" value={`${person.today}/100`} />
              <ProfileMetric label="BADGES" value="2/6" />
            </View>
          </Card>
          {!mine && (
            <View style={styles.social}>
              <Action
                label="⚔️ Duel"
                color={colors.rose}
                onPress={() => {
                  onClose();
                  onDuel();
                }}
              />
              <Action
                label="🔥 Hype"
                color={colors.orange}
                onPress={() => {
                  onClose();
                  onToast(`You hyped ${person.name} · demo`);
                }}
              />
              <Action
                label="👉 Nudge"
                color={colors.surface}
                onPress={() => {
                  onClose();
                  onToast(`Nudge sent to ${person.name} · demo`);
                }}
              />
            </View>
          )}
          {mine && (
            <>
              <Card title="STREAKS">
                <View style={styles.streaks}>
                  <Streak icon="😴" label="Sleep" value="5d" />
                  <Streak icon="🌙" label="Curfew" value="3d" />
                  <Streak icon="👟" label="Step goal" value="9d" />
                </View>
              </Card>
              <Card title="BADGES">
                <View style={styles.badges}>
                  {badges.map(([icon, label, have, need]) => (
                    <View key={label} style={styles.badge}>
                      <Text style={styles.badgeIcon}>{icon}</Text>
                      <View style={styles.badgeCopy}>
                        <Text style={styles.badgeName}>{label}</Text>
                        <ProgressBar
                          value={(have / need) * 100}
                          color={have >= need ? colors.amber : colors.dim}
                          height={5}
                        />
                        <Text style={styles.badgeCount}>
                          {have >= need ? "Unlocked" : `${have}/${need}`}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
              <Card title="PRIVACY">
                <Text style={styles.privacy}>
                  🔒 Screen time is never shared as minutes. Your squad only
                  sees pass/fail for curfew and Phone Down.
                </Text>
              </Card>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
function ProfileMetric({ label, value }) {
  return (
    <View style={styles.profileMetric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}
function Action({ label, color, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.action, { backgroundColor: color }]}
    >
      <Text
        style={[
          styles.actionText,
          { color: color === colors.surface ? "#F8FAFC" : "#030508" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
function Streak({ icon, label, value }) {
  return (
    <View style={styles.streak}>
      <Text style={styles.streakIcon}>{icon}</Text>
      <Text style={styles.streakValue}>{value} 🔥</Text>
      <Text style={styles.streakLabel}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  header: {
    height: 62,
    paddingHorizontal: 16,
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  backText: { color: colors.text, fontSize: 28, lineHeight: 29 },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: "900" },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  groups: { flexDirection: "row", gap: 8 },
  group: {
    flex: 1,
    position: "relative",
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  groupSelected: {
    borderColor: colors.lime,
    backgroundColor: "rgba(200,255,0,.08)",
  },
  groupIcon: { fontSize: 21 },
  groupName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 7,
  },
  groupCount: { color: colors.muted, fontSize: 10, marginTop: 3 },
  check: {
    position: "absolute",
    right: 8,
    top: 8,
    color: "#030508",
    backgroundColor: colors.lime,
    width: 17,
    height: 17,
    textAlign: "center",
    borderRadius: 9,
    fontWeight: "900",
    fontSize: 11,
  },
  profile: { flexDirection: "row", alignItems: "center", gap: 12 },
  profileCopy: { flex: 1 },
  name: { color: colors.text, fontSize: 20, fontWeight: "900" },
  groupText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  },
  points: {
    color: colors.lime,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "right",
  },
  pointsLabel: {
    color: colors.dim,
    fontSize: 7,
    fontWeight: "900",
    marginTop: 2,
  },
  profileMetrics: { flexDirection: "row", gap: 8, marginTop: 16 },
  profileMetric: {
    flex: 1,
    alignItems: "center",
    padding: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricValue: { color: colors.text, fontSize: 13, fontWeight: "900" },
  metricLabel: {
    color: colors.dim,
    fontSize: 8,
    fontWeight: "900",
    marginTop: 3,
  },
  social: { flexDirection: "row", gap: 8 },
  action: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: { fontSize: 12, fontWeight: "900" },
  streaks: { flexDirection: "row", gap: 8 },
  streak: {
    flex: 1,
    alignItems: "center",
    padding: 9,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakIcon: { fontSize: 19 },
  streakValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 13,
    marginTop: 4,
  },
  streakLabel: {
    color: colors.dim,
    fontSize: 8,
    fontWeight: "800",
    marginTop: 3,
  },
  badges: { gap: 8 },
  badge: {
    flexDirection: "row",
    gap: 9,
    padding: 9,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeIcon: { fontSize: 23 },
  badgeCopy: { flex: 1, gap: 5 },
  badgeName: { color: colors.text, fontWeight: "900", fontSize: 11 },
  badgeCount: { color: colors.dim, fontSize: 9, fontWeight: "700" },
  privacy: { color: colors.muted, fontSize: 12, lineHeight: 19 },
});
