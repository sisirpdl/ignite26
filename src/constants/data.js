export const ME = 1;

export const squad = [
  {
    id: 1,
    name: "Shishir",
    avatar: "Kai",
    color: "#66852D",
    recovery: 88,
    score: 1710,
    today: 90,
  },
  {
    id: 2,
    name: "Anshu",
    avatar: "Nova",
    color: "#39857F",
    recovery: 92,
    score: 1750,
    today: 96,
  },
  {
    id: 3,
    name: "Sakshyam",
    avatar: "Rio",
    color: "#8B6EAE",
    recovery: 74,
    score: 1560,
    today: 84,
  },
  {
    id: 4,
    name: "Supratik",
    avatar: "Zane",
    color: "#BD754C",
    recovery: 81,
    score: 1640,
    today: 88,
  },
];

export const monthlyScores = {
  1: [
    82, 88, 65, 94, 71, 83, 96, 52, 88, 91, 69, 98, 76, 84, 93, 61, 89, 95, 90,
  ],
  2: [
    91, 94, 78, 96, 85, 66, 93, 88, 97, 75, 90, 82, 95, 71, 98, 86, 92, 89, 96,
  ],
  3: [
    73, 77, 91, 58, 84, 88, 66, 93, 72, 81, 95, 63, 86, 90, 74, 98, 69, 83, 84,
  ],
  4: [
    86, 84, 69, 92, 77, 96, 81, 62, 90, 94, 73, 87, 98, 68, 85, 91, 79, 96, 88,
  ],
};

export const initialMessages = [
  {
    id: "m1",
    type: "system",
    text: "📈 Month Challenge is live — verified daily scores now build your Challenge Score.",
    time: "6:00 AM",
  },
  {
    id: "m2",
    type: "system",
    text: "🌙 Curfew report: 3/4 made it. Sakshyam broke curfew last night 👀",
    time: "6:01 AM",
    alert: true,
  },
  {
    id: "m3",
    type: "activity",
    userId: 2,
    title: "Morning Trail Run",
    stats: ["5.2 km", "27:41", "94 Fair score"],
    time: "7:58 AM",
    reactions: { "🔥": [1, 4] },
  },
  {
    id: "m4",
    type: "text",
    userId: 2,
    text: "Woke up fresh with 92% recovery. Let’s crush the trail today!",
    time: "8:45 AM",
    reactions: { "💪": [3] },
  },
  {
    id: "m4a",
    type: "snap",
    userId: 3,
    caption: "Rough sleep, HRV bouncing back though 💀",
    emoji: "😵‍💫",
    time: "9:02 AM",
    reactions: {},
  },
  {
    id: "m5",
    type: "poll",
    userId: 4,
    question: "Group trail run at 6 PM?",
    options: [
      { label: "I’m in 🙋", votes: [2, 4] },
      { label: "Next time", votes: [3] },
    ],
    time: "9:10 AM",
  },
  {
    id: "m6",
    type: "text",
    userId: 1,
    text: "Heading out now, see you on the board 😤",
    time: "9:25 AM",
    reactions: {},
  },
  {
    id: "m7",
    type: "system",
    text: "⚡ Clutch announced: Sleep 7h+ tonight. Starts 10 PM, everyone’s in.",
    time: "10:00 AM",
  },
];

export const routes = [
  {
    id: "r1",
    name: "Riverside Loop",
    km: 5.2,
    elev: 18,
    record: 1450,
    best: 1522,
    king: 2,
  },
  {
    id: "r2",
    name: "Hill Sprint",
    km: 3.1,
    elev: 96,
    record: 905,
    best: 962,
    king: 4,
  },
  {
    id: "r3",
    name: "Park Circuit",
    km: 7.8,
    elev: 34,
    record: 2290,
    best: 2290,
    king: 1,
  },
];

export const bios = {
  hrv: 74,
  rhr: 52,
  sleepMinutes: 492,
  sleepEfficiency: 92,
  steps: 10420,
  stepGoal: 10000,
  kcal: 540,
  kcalGoal: 700,
  stress: 31,
  bodyBattery: 76,
  screen: 204,
  screenLimit: 240,
  vo2: 48.2,
};

export const quickReplies = [
  "🔥",
  "💪 Let’s go",
  "😴 Rest day",
  "🏃 Heading out",
  "👀 Who’s up?",
];
