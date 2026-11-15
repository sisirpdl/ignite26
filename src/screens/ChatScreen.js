import { useBackendState } from "../data/BackendProvider";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "../components/common/Avatar";
import ModalSheet from "../components/common/ModalSheet";
import { initialMessages, ME, quickReplies, squad } from "../constants/data";
import { colors, type } from "../styles/theme";

export default function ChatScreen({
  onUnread,
  onProfile,
  onOpenGame,
  onToast,
}) {
  const [messages, setMessages] = useBackendState("messages", initialMessages);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [draftPoll, setDraftPoll] = useState("");
  const [snapView, setSnapView] = useState(null);
  const [snapDraft, setSnapDraft] = useState(false),
    [snapEmoji, setSnapEmoji] = useState("🔥"),
    [snapCaption, setSnapCaption] = useState("");
  const scroller = useRef(null);
  const messageNumber = useRef(10);
  useEffect(() => {
    setTimeout(() => scroller.current?.scrollToEnd({ animated: false }), 120);
  }, []);
  useEffect(() => {
    if (!snapView) return undefined;
    const timer = setTimeout(() => setSnapView(null), 4500);
    return () => clearTimeout(timer);
  }, [snapView]);
  const person = (id) => squad.find((member) => member.id === id);
  const nextId = (prefix) => {
    messageNumber.current += 1;
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  };
  const react = (id, emoji) =>
    setMessages((all) =>
      all.map((message) =>
        message.id !== id
          ? message
          : {
              ...message,
              reactions: {
                ...message.reactions,
                [emoji]: [
                  ...new Set([...(message.reactions?.[emoji] || []), ME]),
                ],
              },
            },
      ),
    );
  const send = (value = text) => {
    const clean = value.trim();
    if (!clean) return;
    const id = nextId("n");
    setMessages((all) => [
      ...all,
      { id, type: "text", userId: ME, text: clean, time: "Now", reactions: {} },
    ]);
    setText("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = squad[1];
      const responses = [
        "Let’s gooo 🔥",
        "Catch me if you can 😤",
        "Trail at 6, no excuses",
      ];
      setMessages((all) => [
        ...all,
        {
          id: nextId("r"),
          type: "text",
          userId: reply.id,
          text: responses[messageNumber.current % responses.length],
          time: "Now",
          reactions: {},
        },
      ]);
      onUnread(1);
    }, 1200);
  };
  const vote = (id, index) =>
    setMessages((all) =>
      all.map((message) =>
        message.id !== id
          ? message
          : {
              ...message,
              options: message.options.map((option, i) =>
                i === index
                  ? { ...option, votes: [...new Set([...option.votes, ME])] }
                  : {
                      ...option,
                      votes: option.votes.filter((id) => id !== ME),
                    },
              ),
            },
      ),
    );
  const createPoll = () => {
    if (!draftPoll.trim()) return;
    setMessages((all) => [
      ...all,
      {
        id: nextId("p"),
        type: "poll",
        userId: ME,
        question: draftPoll,
        options: [
          { label: "I’m in 🙋", votes: [ME] },
          { label: "Pass", votes: [] },
        ],
        time: "Now",
      },
    ]);
    setDraftPoll("");
    setSheet(false);
  };
  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        {squad.map((member) => (
          <Pressable
            key={member.id}
            accessibilityRole="button"
            accessibilityLabel={`Open ${member.name} profile`}
            onPress={() => onProfile(member)}
            style={styles.squadMember}
          >
            <Avatar person={member} size={46} />
            <Text style={styles.squadName}>
              {member.id === ME ? "You" : member.name}
            </Text>
            <Text style={[styles.squadRecovery, { color: member.color }]}>
              {member.recovery}%
            </Text>
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile and settings"
          onPress={() => onProfile(squad[0])}
          style={styles.squadMember}
        >
          <Ionicons name="settings-outline" size={25} color={colors.muted} />
          <Text style={styles.squadName}>Settings</Text>
        </Pressable>
      </View>
      <ScrollView
        ref={scroller}
        onContentSizeChange={() =>
          scroller.current?.scrollToEnd({ animated: true })
        }
        contentContainerStyle={styles.feed}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.today}>TODAY</Text>
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            person={person(message.userId)}
            onReact={react}
            onVote={vote}
            onProfile={onProfile}
            onSnap={(item) => {
              setMessages((all) =>
                all.map((m) => (m.id === item.id ? { ...m, opened: true } : m)),
              );
              setSnapView(item);
            }}
          />
        ))}
        {typing && (
          <View style={styles.typing}>
            <Avatar person={squad[1]} size={28} />
            <Text style={styles.typingText}>Nova is typing•••</Text>
          </View>
        )}
      </ScrollView>
      <ScrollView
        style={{ flexGrow: 0, flexShrink: 0 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quick}
      >
        {quickReplies.map((reply) => (
          <Pressable
            accessibilityRole="button"
            key={reply}
            style={styles.quickChip}
            onPress={() => send(reply)}
          >
            <Text style={styles.quickText}>{reply}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.composer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="More chat actions"
          onPress={() => setSheet(true)}
          style={styles.plus}
        >
          <Ionicons name="add" size={23} color={colors.cyan} />
        </Pressable>
        <TextInput
          accessibilityLabel="Message the squad"
          maxLength={4000}
          value={text}
          onChangeText={setText}
          placeholder="Message the squad…"
          placeholderTextColor={colors.dim}
          style={styles.input}
          multiline
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          onPress={() => send()}
          disabled={!text.trim()}
          style={[styles.send, !text.trim() && styles.sendDisabled]}
        >
          <Ionicons
            name="arrow-up"
            size={19}
            color={text.trim() ? "#030508" : colors.dim}
          />
        </Pressable>
      </View>
      <ModalSheet
        visible={sheet}
        title="Create for the squad"
        onClose={() => setSheet(false)}
      >
        <View style={styles.sheetOptions}>
          {snapDraft && (
            <View style={styles.poll}>
              <Text style={styles.pollQuestion}>Make a squad snap</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["🔥", "💪", "🏃", "😴", "😵‍💫"].map((emoji) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Choose ${emoji}`}
                    key={emoji}
                    onPress={() => setSnapEmoji(emoji)}
                    style={{
                      padding: 8,
                      borderRadius: 12,
                      backgroundColor:
                        snapEmoji === emoji ? "#6D28D9" : "#172033",
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                accessibilityLabel="Snap caption"
                value={snapCaption}
                onChangeText={setSnapCaption}
                maxLength={180}
                placeholder="Caption your moment…"
                placeholderTextColor={colors.dim}
                style={styles.pollInput}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setMessages((all) => [
                    ...all,
                    {
                      id: nextId("snap"),
                      type: "snap",
                      userId: ME,
                      emoji: snapEmoji,
                      caption: snapCaption.trim() || "Squad moment",
                      time: "Now",
                      reactions: {},
                    },
                  ]);
                  setSnapCaption("");
                  setSnapDraft(false);
                  setSheet(false);
                }}
                style={[styles.pollButton, { backgroundColor: colors.violet }]}
              >
                <Text style={styles.pollButtonText}>Send view-once snap</Text>
              </Pressable>
            </View>
          )}

          <SheetAction
            icon="camera-outline"
            label="Send a snap"
            description="View once, then it’s gone"
            onPress={() => {
              setSnapDraft(true);
            }}
          />
          <SheetAction
            icon="flag-outline"
            label="Squad challenge"
            description="React to join · ±2 pts tonight"
            onPress={() => {
              setSheet(false);
              onOpenGame();
            }}
          />
          <Text style={styles.pollLabel}>START A POLL</Text>
          <TextInput
            value={draftPoll}
            onChangeText={setDraftPoll}
            placeholder="Ask your squad…"
            placeholderTextColor={colors.dim}
            style={styles.pollInput}
          />
          <Pressable
            accessibilityRole="button"
            onPress={createPoll}
            style={styles.pollButton}
          >
            <Text style={styles.pollButtonText}>Post poll</Text>
          </Pressable>
        </View>
      </ModalSheet>
      <Modal
        visible={Boolean(snapView)}
        animationType="fade"
        onRequestClose={() => setSnapView(null)}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => setSnapView(null)}
          style={styles.snapView}
        >
          <View style={styles.snapProgress}>
            <View style={styles.snapProgressFill} />
          </View>
          <View style={styles.snapHeader}>
            <Avatar
              person={snapView ? person(snapView.userId) : squad[0]}
              size={34}
            />
            <Text style={styles.snapName}>
              {snapView ? person(snapView.userId).name : ""}
            </Text>
            <Text style={styles.snapTime}>view once</Text>
          </View>
          <View style={styles.snapCenter}>
            <Text style={styles.snapEmoji}>{snapView?.emoji}</Text>
            <Text style={styles.snapCaption}>{snapView?.caption}</Text>
          </View>
          <Text style={styles.snapHint}>Tap to close</Text>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
function Message({ message, person, onReact, onVote, onProfile, onSnap }) {
  if (message.type === "system")
    return (
      <View style={[styles.system, message.alert && styles.alert]}>
        <Text style={styles.systemText}>{message.text}</Text>
        <Text style={styles.time}>{message.time}</Text>
      </View>
    );
  const mine = message.userId === ME;
  return (
    <View style={[styles.messageRow, mine && styles.mineRow]}>
      {!mine && (
        <Pressable accessibilityRole="button" onPress={() => onProfile(person)}>
          <Avatar person={person} size={31} />
        </Pressable>
      )}
      <View style={[styles.bubbleWrap, mine && styles.mineWrap]}>
        {!mine && <Text style={styles.sender}>{person.name}</Text>}
        {message.type === "activity" ? (
          <View style={styles.activity}>
            <Text style={styles.activityTitle}>🏃 {message.title}</Text>
            <View style={styles.stats}>
              {message.stats.map((stat) => (
                <Text key={stat} style={styles.stat}>
                  {stat}
                </Text>
              ))}
            </View>
          </View>
        ) : message.type === "poll" ? (
          <View style={styles.poll}>
            <Text style={styles.pollQuestion}>{message.question}</Text>
            {message.options.map((option, index) => (
              <Pressable
                accessibilityRole="button"
                key={option.label}
                onPress={() => onVote(message.id, index)}
                style={styles.pollOption}
              >
                <Text style={styles.pollOptionText}>{option.label}</Text>
                <Text style={styles.voteCount}>{option.votes.length}</Text>
              </Pressable>
            ))}
          </View>
        ) : message.type === "snap" ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => !message.opened && onSnap(message)}
            style={[styles.snapCard, message.opened && styles.snapOpened]}
          >
            <Text style={styles.snapCardEmoji}>
              {message.opened ? "✓" : message.emoji}
            </Text>
            <View>
              <Text style={styles.snapCardTitle}>
                {message.opened ? "Opened snap" : "New Snap • Tap to view"}
              </Text>
              <Text style={styles.snapCardSub}>
                {message.opened ? "View once" : "Expires after viewing"}
              </Text>
            </View>
          </Pressable>
        ) : (
          <View style={[styles.bubble, mine && styles.mineBubble]}>
            <Text
              style={[
                styles.messageText,
                mine && { color: "#03131C", fontWeight: "600" },
              ]}
            >
              {message.text}
            </Text>
          </View>
        )}
        <Text style={styles.time}>{message.time}</Text>
        {message.reactions && (
          <View style={styles.reactions}>
            {Object.entries(message.reactions).map(([emoji, votes]) => (
              <Pressable
                accessibilityRole="button"
                key={emoji}
                onPress={() => onReact(message.id, emoji)}
                style={styles.reaction}
              >
                <Text style={styles.reactionText}>
                  {emoji} {votes.length}
                </Text>
              </Pressable>
            ))}
            {message.type === "text" && (
              <Pressable
                accessibilityRole="button"
                onPress={() => onReact(message.id, "🔥")}
                style={styles.reaction}
              >
                <Text style={styles.reactionText}>＋</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
function SheetAction({ icon, label, description, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.sheetAction}
    >
      <Ionicons name={icon} size={23} color={colors.cyan} />
      <View>
        <Text style={styles.sheetLabel}>{label}</Text>
        <Text style={styles.sheetDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  squadMember: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  squadName: { color: "#D4E3EF", fontSize: 9, fontWeight: "800" },
  squadRecovery: { fontSize: 9, fontWeight: "900" },
  header: {
    padding: 16,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#101725",
  },
  title: { color: colors.text, fontWeight: "900", fontSize: 22 },
  members: { flexDirection: "row", alignItems: "center" },
  memberMore: {
    marginLeft: 4,
    color: colors.muted,
    fontWeight: "900",
    fontSize: 11,
  },
  feed: { padding: 14, gap: 12 },
  today: {
    color: colors.dim,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.7,
    alignSelf: "center",
  },
  system: {
    alignSelf: "center",
    backgroundColor: "#101725",
    borderRadius: 12,
    padding: 10,
    maxWidth: "93%",
    alignItems: "center",
  },
  alert: { borderWidth: 1, borderColor: "rgba(244,63,94,.3)" },
  systemText: {
    color: colors.muted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
  messageRow: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  mineRow: { justifyContent: "flex-end" },
  bubbleWrap: { maxWidth: "80%" },
  mineWrap: { alignItems: "flex-end" },
  sender: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 3,
  },
  bubble: {
    backgroundColor: colors.surface,
    borderRadius: 17,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 11,
  },
  mineBubble: {
    backgroundColor: "#06B6D4",
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 4,
    borderColor: "#06B6D4",
  },
  messageText: { color: colors.text, fontSize: 13, lineHeight: 18 },
  time: { color: colors.dim, fontSize: 9, marginTop: 4 },
  activity: {
    padding: 12,
    borderRadius: 17,
    backgroundColor: "#102A35",
    borderWidth: 1,
    borderColor: "#164E63",
  },
  activityTitle: { color: colors.text, fontWeight: "900", fontSize: 13 },
  stats: { flexDirection: "row", gap: 8, marginTop: 8 },
  stat: { color: colors.cyan, fontWeight: "800", fontSize: 10 },
  reactions: { flexDirection: "row", gap: 4, marginTop: 4, flexWrap: "wrap" },
  reaction: {
    paddingHorizontal: 7,
    minHeight: 32,
    justifyContent: "center",
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "#101725",
    borderWidth: 1,
    borderColor: colors.border,
  },
  reactionText: { color: colors.text, fontSize: 10 },
  poll: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pollQuestion: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 13,
    marginBottom: 10,
  },
  pollOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 9,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    marginTop: 5,
  },
  pollOptionText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  voteCount: { color: colors.cyan, fontWeight: "900", fontSize: 11 },
  typing: { flexDirection: "row", alignItems: "center", gap: 7 },
  typingText: { color: colors.muted, fontSize: 11 },
  quick: { gap: 7, paddingHorizontal: 12, paddingBottom: 8 },
  quickChip: {
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 15,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  composer: {
    padding: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderColor: "#101725",
  },
  plus: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 44,
    paddingHorizontal: 13,
    paddingVertical: 11,
    color: colors.text,
    borderRadius: 14,
    backgroundColor: "#101725",
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 13,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.cyan,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: { backgroundColor: colors.surface },
  sheetOptions: { gap: 9 },
  sheetAction: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetLabel: { color: colors.text, fontWeight: "900", fontSize: 13 },
  sheetDescription: { color: colors.muted, fontSize: 10, marginTop: 3 },
  pollLabel: {
    color: colors.muted,
    fontWeight: "900",
    letterSpacing: 1.5,
    fontSize: 10,
    marginTop: 8,
  },
  pollInput: {
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 12,
  },
  pollButton: {
    padding: 13,
    borderRadius: 12,
    backgroundColor: colors.amber,
    alignItems: "center",
  },
  pollButtonText: { color: "#030508", fontWeight: "900" },
  snapCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#30204D",
    borderWidth: 1,
    borderColor: "#8b5cf6",
  },
  snapOpened: {
    opacity: 0.55,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  snapCardEmoji: { fontSize: 26 },
  snapCardTitle: { color: colors.text, fontSize: 12, fontWeight: "900" },
  snapCardSub: { color: "#D8B4FE", fontSize: 9, marginTop: 3 },
  snapView: { flex: 1, backgroundColor: "#34215a", padding: 16 },
  snapProgress: {
    height: 4,
    backgroundColor: "rgba(255,255,255,.25)",
    borderRadius: 3,
    overflow: "hidden",
  },
  snapProgressFill: { width: "100%", height: "100%", backgroundColor: "white" },
  snapHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 15,
  },
  snapName: { color: "white", fontSize: 14, fontWeight: "900" },
  snapTime: { color: "#ddd6fe", fontSize: 10 },
  snapCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  snapEmoji: { fontSize: 100 },
  snapCaption: {
    color: "white",
    fontWeight: "900",
    fontSize: 20,
    textAlign: "center",
    marginTop: 25,
  },
  snapHint: {
    color: "#ddd6fe",
    fontSize: 11,
    textAlign: "center",
    paddingBottom: 24,
  },
});
