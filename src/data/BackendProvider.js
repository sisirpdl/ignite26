import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../styles/theme";
const Context = createContext(null);
const URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:8787"
    : "http://127.0.0.1:8787");
const SESSION = "@clutch/backend-session";
export default function BackendProvider({ children }) {
  const [state, setState] = useState({});
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Connecting");
  const [error, setError] = useState("");
  const docs = useRef({}),
    token = useRef(""),
    dirty = useRef(new Set()),
    inFlight = useRef(false),
    live = useRef(true);
  const request = async (path, options = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(URL + path, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.current}`,
          ...options.headers,
        },
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Backend request failed");
      return result;
    } finally {
      clearTimeout(timeout);
    }
  };
  const connect = async () => {
    setError("");
    setStatus("Connecting");
    try {
      token.current = (await AsyncStorage.getItem(SESSION)) || "";
      if (!token.current) {
        const session = await request("/api/session", { method: "POST" });
        token.current = session.token;
        await AsyncStorage.setItem(SESSION, session.token);
      }
      const data = await request("/api/state");
      docs.current = data.documents;
      setState(
        Object.fromEntries(
          Object.entries(data.documents).map(([key, doc]) => [key, doc.value]),
        ),
      );
      setReady(true);
      setStatus("Backend connected");
    } catch (e) {
      setError(e.message);
      setStatus("Connection failed");
    }
  };
  const update = (key, initial, action) => {
    const current = docs.current[key] || { revision: 0, value: initial };
    const value = typeof action === "function" ? action(current.value) : action;
    docs.current[key] = { ...current, value };
    dirty.current.add(key);
    setState((all) => ({ ...all, [key]: value }));
    setStatus("Saving…");
  };
  useEffect(() => {
    live.current = true;
    connect();
    const timer = setInterval(async () => {
      if (inFlight.current || !dirty.current.size) return;
      inFlight.current = true;
      try {
        for (const key of [...dirty.current]) {
          const doc = docs.current[key];
          const result = await request(`/api/state/${key}`, {
            method: "PUT",
            body: JSON.stringify(doc),
          });
          if (docs.current[key] === doc) dirty.current.delete(key);
          docs.current[key] = {
            ...docs.current[key],
            revision: result.revision,
          };
        }
        if (live.current) {
          setError("");
          setStatus(dirty.current.size ? "Saving…" : "Saved to backend");
        }
      } catch (e) {
        if (live.current) {
          setError(e.message);
          setStatus("Not saved — retrying");
        }
        if (e.message.includes("another tab")) dirty.current.clear();
      } finally {
        inFlight.current = false;
      }
    }, 700);
    return () => {
      live.current = false;
      clearInterval(timer);
    };
  }, []);
  if (!ready)
    return (
      <View style={s.loading}>
        <Text style={s.logo}>clutch ⚡</Text>
        <Text style={s.text}>{status}</Text>
        {error ? (
          <>
            <Text style={s.error}>{error}</Text>
            <Text style={s.text}>
              Start the API with npm run server. On a phone, set
              EXPO_PUBLIC_API_URL to your computer’s LAN address.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={connect}
              style={s.retry}
            >
              <Text>Retry connection</Text>
            </Pressable>
          </>
        ) : null}
      </View>
    );
  return (
    <Context.Provider value={{ state, update, status, error }}>
      {children}
    </Context.Provider>
  );
}
export function useBackendState(key, initial) {
  const ctx = useContext(Context);
  return [
    ctx.state[key] ?? initial,
    (action) => ctx.update(key, initial, action),
  ];
}
export function useBackendStatus() {
  return useContext(Context);
}
const s = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 28,
    justifyContent: "center",
    gap: 18,
  },
  logo: { fontSize: 42, color: colors.lime, fontWeight: "900" },
  text: { color: colors.muted, lineHeight: 22 },
  error: { color: colors.rose },
  retry: {
    backgroundColor: colors.lime,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
});
