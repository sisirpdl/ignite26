import { Text } from "./common/Typography";
import { useBackendState } from "../data/BackendProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Avatar from "./common/Avatar";
import ProgressBar from "./common/ProgressBar";
import { ME, squad } from "../constants/data";
import { colors } from "../styles/theme";

const metrics = [
  ["steps", "👟 Steps"],
  ["sleep", "😴 Sleep"],
  ["recovery", "💚 Recovery"],
  ["stress", "🧘 Low stress"],
];
const bonuses = [
  ["👟", "500 steps in 15 minutes", 2],
  ["❤️", "Hold 120+ bpm for 5 minutes", 3],
  ["📵", "Phone face-down for 20 minutes", 1],
];

const gameInitial = {
  score: { 1: 0, 2: 3, 3: -2, 4: 1 },
  metric: "steps",
  opponent: 2,
  duel: false,
  challenge: false,
  clutch: "upcoming",
  phoneUntil: 0,
  sent: 0,
  badges: { clutch: 1, duel: 0, phone: 0 },
};
function useGameField(key) {
  const [game, setGame] = useBackendState("game", gameInitial);
  return [
    game[key] ?? gameInitial[key],
    (action) =>
      setGame((previous) => ({
        ...previous,
        [key]:
          typeof action === "function"
            ? action(previous[key] ?? gameInitial[key])
            : action,
      })),
  ];
}

export default function GameModal({
  visible,
  onClose,
  onToast,
  initialPool = "duels",
}) {
  const [pool, setPool] = useState("duels");
  useEffect(() => {
    if (visible) setPool(initialPool);
  }, [visible, initialPool]);
  const [score, setScore] = useGameField("score");
  const [metric, setMetric] = useGameField("metric");
  const [opponent, setOpponent] = useGameField("opponent");
  const [duel, setDuel] = useGameField("duel");
  const [challenge, setChallenge] = useGameField("challenge");
  const [clutch, setClutch] = useGameField("clutch");
  const [phoneUntil, setPhoneUntil] = useGameField("phoneUntil");
  const [clock, setClock] = useState(Date.now());
  const phone = Math.max(0, Math.ceil((phoneUntil - clock) / 1000));
  const setPhone = (seconds) => {
    setClock(Date.now());
    setPhoneUntil(seconds ? Date.now() + seconds * 1000 : 0);
  };
  const [sent, setSent] = useGameField("sent");
  const [badges, setBadges] = useGameField("badges");
  useEffect(() => {
    if (!phoneUntil) return;
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [phoneUntil]);
  const canSend = () => {
    if (sent >= 3) {
      onToast("You’ve sent all 3 challenges for today");
      return false;
    }
    setSent((v) => v + 1);
    return true;
  };
  const adjust = (id, n, label) => {
    setScore((all) => ({ ...all, [id]: (all[id] || 0) + n }));
    onToast(label);
  };
  const settleDuel = () => {
    const win = opponent !== 2;
    adjust(
      ME,
      win ? 2 : -2,
      win ? "Duel settled: +2 points" : "Duel settled: −2 points",
    );
    adjust(opponent, win ? -2 : 2, "Opponent score updated");
    if (win) setBadges((b) => ({ ...b, duel: b.duel + 1 }));
    setDuel(false);
  };
  const settleChallenge = () => {
    adjust(ME, 1, "Challenge settled: +1 point");
    adjust(2, 1, "Anshu split the pot");
    adjust(4, -2, "Supratik missed the challenge");
    setChallenge(false);
  };
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.page}>
        <View style={s.head}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close arena"
            style={{ minWidth: 44, minHeight: 44, justifyContent: "center" }}
            onPress={onClose}
          >
            <Text style={s.back}>‹</Text>
          </Pressable>
          <View>
            <Text style={s.over}>THE SQUAD</Text>
            <Text style={s.title}>Clutch arena</Text>
          </View>
          <Text style={s.sends}>
            {3 - sent}/3{`\n`}sends
          </Text>
        </View>
        <View style={s.tabs}>
          {[
            ["duels", "Duels"],
            ["squad", "Squad"],
            ["clutch", "Clutch"],
            ["rewards", "Rewards"],
          ].map(([id, label]) => (
            <Pressable
              accessibilityRole="button"
              key={id}
              onPress={() => setPool(id)}
              style={[s.tab, pool === id && s.tabOn]}
            >
              <Text style={[s.tabText, pool === id && s.tabTextOn]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
        <ScrollView contentContainerStyle={s.content}>
          <Score score={score} />
          {pool === "duels" && (
            <>
              <Panel
                title="1V1 DUEL"
                sub="Winner +2 · loser −2 on today’s score."
              >
                <View style={s.people}>
                  {squad
                    .filter((p) => p.id !== ME)
                    .map((p) => (
                      <Pressable
                        accessibilityRole="button"
                        key={p.id}
                        onPress={() => setOpponent(p.id)}
                        style={[s.person, opponent === p.id && s.selected]}
                      >
                        <Avatar person={p} size={32} />
                        <Text style={s.personText}>{p.name}</Text>
                      </Pressable>
                    ))}
                </View>
                <Metric value={metric} onChange={setMetric} />
                <Button
                  label={duel ? "Settle demo duel" : "⚔️ Send duel"}
                  onPress={() =>
                    duel ? settleDuel() : canSend() && setDuel(true)
                  }
                  color={duel ? colors.lime : colors.rose}
                />
              </Panel>
              <Panel
                title="SCORE EVENTS"
                sub="Why today’s verified score moved."
              >
                <Text style={s.event}>
                  ⚔️ Anshu won a Steps duel <Text style={s.plus}>+2</Text>
                </Text>
                <Text style={s.event}>
                  💥 Supratik cleared a bonus <Text style={s.plus}>+1</Text>
                </Text>
              </Panel>
            </>
          )}
          {pool === "squad" && (
            <>
              <Panel
                title="SQUAD CHALLENGE"
                sub="Finishers split stakes from anyone who misses."
              >
                <Metric value={metric} onChange={setMetric} />
                <Button
                  label={
                    challenge ? "Settle today’s result" : "🏁 Send challenge"
                  }
                  onPress={() =>
                    challenge
                      ? settleChallenge()
                      : canSend() && setChallenge(true)
                  }
                />
              </Panel>
              <Panel
                title="BONUS CHALLENGES"
                sub="Verified bonuses move only your own daily score."
              >
                {bonuses.map(([icon, title, points]) => (
                  <Pressable
                    accessibilityRole="button"
                    key={title}
                    onPress={() =>
                      adjust(ME, points, `Bonus verified: +${points} points`)
                    }
                    style={s.bonus}
                  >
                    <Text>{icon}</Text>
                    <Text style={s.bonusText}>{title}</Text>
                    <Text style={s.plus}>+{points}</Text>
                  </Pressable>
                ))}
              </Panel>
            </>
          )}
          {pool === "clutch" && (
            <>
              <Panel
                title="CLUTCH"
                sub="Announced 12 hours ahead. Everyone participates."
              >
                <Text style={s.clutch}>😴 Sleep 7h+ tonight</Text>
                <Text style={s.muted}>
                  {clutch === "upcoming"
                    ? "Starts tonight · 10 PM"
                    : clutch === "live"
                      ? "Live until 8 AM"
                      : "3/4 passed"}
                </Text>
                {clutch === "upcoming" && (
                  <Button
                    label="Start Clutch"
                    onPress={() => setClutch("live")}
                  />
                )}{" "}
                {clutch === "live" && (
                  <Button
                    label="Settle overnight result"
                    onPress={() => {
                      setClutch("settled");
                      setBadges((b) => ({ ...b, clutch: b.clutch + 1 }));
                      onToast("Clutch settled — 3 of 4 passed");
                    }}
                  />
                )}
              </Panel>
              <Panel
                title="PHONE DOWN"
                sub="Only pass/fail is visible to the squad."
              >
                {phone ? (
                  <>
                    <Text style={s.timer}>
                      {String(Math.floor(phone / 60)).padStart(2, "0")}:
                      {String(phone % 60).padStart(2, "0")}
                    </Text>
                    <Button
                      label="Mark complete"
                      onPress={() => {
                        setPhone(0);
                        setBadges((b) => ({ ...b, phone: b.phone + 1 }));
                        adjust(ME, 1, "Phone Down complete: +1 point");
                      }}
                    />
                  </>
                ) : (
                  <Button
                    label="📵 Start 30-minute Phone Down"
                    color="#d946ef"
                    onPress={() => canSend() && setPhone(1800)}
                  />
                )}
              </Panel>
            </>
          )}
          {pool === "rewards" && (
            <Panel title="BADGES" sub="Progress updates as games settle.">
              {[
                ["⚡", "Clutch King", badges.clutch, 3],
                ["⚔️", "Duelist", badges.duel, 1],
                ["📵", "Iron Will", badges.phone, 1],
              ].map(([icon, name, have, need]) => (
                <View key={name} style={s.badge}>
                  <Text style={s.badgeIcon}>{icon}</Text>
                  <View style={s.flex}>
                    <Text style={s.badgeName}>{name}</Text>
                    <ProgressBar
                      value={(have / need) * 100}
                      color={have >= need ? colors.amber : colors.dim}
                      height={6}
                    />
                    <Text style={s.muted}>
                      {have >= need ? "Unlocked" : `${have}/${need}`}
                    </Text>
                  </View>
                </View>
              ))}
            </Panel>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
function Score({ score }) {
  return (
    <View style={s.board}>
      {squad.map((p) => (
        <View key={p.id} style={s.scoreRow}>
          <Avatar person={p} size={26} />
          <Text style={s.flex}>{p.id === ME ? "You" : p.name}</Text>
          <Text style={s.scoreValue}>{p.today + (score[p.id] || 0)}</Text>
          <Text
            style={[
              s.delta,
              { color: (score[p.id] || 0) >= 0 ? colors.emerald : colors.rose },
            ]}
          >
            {(score[p.id] || 0) >= 0 ? "+" : ""}
            {score[p.id] || 0}
          </Text>
        </View>
      ))}
    </View>
  );
}
function Metric({ value, onChange }) {
  return (
    <View style={s.metrics}>
      {metrics.map(([id, label]) => (
        <Pressable
          accessibilityRole="button"
          key={id}
          onPress={() => onChange(id)}
          style={[s.metric, value === id && s.metricOn]}
        >
          <Text style={[s.metricText, value === id && s.metricTextOn]}>
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
function Panel({ title, sub, children }) {
  return (
    <View style={s.panel}>
      <Text style={s.panelTitle}>{title}</Text>
      <Text style={s.muted}>{sub}</Text>
      <View style={s.body}>{children}</View>
    </View>
  );
}
function Button({ label, onPress, color = colors.lime }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[s.button, { backgroundColor: color }]}
    >
      <Text
        style={[s.buttonText, color !== colors.lime && { color: "#FFFFFF" }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  head: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  back: { fontSize: 30, color: colors.text },
  over: {
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "900",
    color: colors.muted,
  },
  title: { fontSize: 21, fontWeight: "900", color: colors.text },
  sends: {
    marginLeft: "auto",
    textAlign: "right",
    fontSize: 10,
    fontWeight: "900",
    color: colors.accent,
  },
  tabs: { flexDirection: "row", padding: 8, gap: 5 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 10 },
  tabOn: { backgroundColor: colors.lime },
  tabText: { fontSize: 10, fontWeight: "900", color: colors.muted },
  tabTextOn: { color: "#030508" },
  content: { padding: 14, gap: 12, paddingBottom: 30 },
  board: {
    padding: 12,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1, color: colors.text, fontWeight: "800", fontSize: 12 },
  scoreValue: { fontWeight: "900", color: colors.text },
  delta: { width: 25, fontWeight: "900", textAlign: "right" },
  panel: {
    padding: 15,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  panelTitle: {
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: "900",
    color: colors.muted,
  },
  muted: { fontSize: 11, lineHeight: 16, color: colors.muted, marginTop: 4 },
  body: { gap: 10, marginTop: 12 },
  people: { flexDirection: "row", gap: 6 },
  person: {
    flex: 1,
    alignItems: "center",
    padding: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: { borderColor: colors.rose, backgroundColor: "rgba(244,63,94,.1)" },
  personText: {
    fontSize: 9,
    color: colors.muted,
    fontWeight: "800",
    marginTop: 4,
  },
  metrics: { flexDirection: "row", gap: 5 },
  metric: {
    flex: 1,
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
  },
  metricOn: {
    backgroundColor: "rgba(200,255,0,.1)",
    borderWidth: 1,
    borderColor: colors.lime,
  },
  metricText: { fontSize: 8, color: colors.muted, fontWeight: "800" },
  metricTextOn: { color: colors.accent },
  button: { padding: 13, alignItems: "center", borderRadius: 12 },
  buttonText: { color: "#030508", fontSize: 12, fontWeight: "900" },
  event: { color: colors.muted, fontSize: 12, paddingVertical: 4 },
  plus: { color: colors.emerald, fontWeight: "900" },
  bonus: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
  },
  bonusText: { flex: 1, color: colors.text, fontSize: 11, fontWeight: "700" },
  clutch: { color: colors.text, fontSize: 15, fontWeight: "900" },
  timer: {
    color: colors.accent,
    textAlign: "center",
    fontSize: 34,
    fontWeight: "900",
  },
  badge: {
    flexDirection: "row",
    gap: 9,
    padding: 9,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    marginTop: 7,
  },
  badgeIcon: { fontSize: 23 },
  badgeName: { fontSize: 12, fontWeight: "900", color: colors.text },
});
