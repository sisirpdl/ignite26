import { useBackendState } from "../data/BackendProvider";
import React, { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polygon, Polyline } from "../components/MapCanvas";
import * as Location from "expo-location";
import Avatar from "../components/common/Avatar";
import Card from "../components/common/Card";
import ProgressBar from "../components/common/ProgressBar";
import { ME, routes, squad } from "../constants/data";
import { formatTime } from "../utils/format";
import { colors } from "../styles/theme";

const campus = {
  latitude: 44.0132,
  longitude: -97.1112,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};
const coordinate = (x, y) => ({
  latitude: campus.latitude + y * 0.00035,
  longitude: campus.longitude + x * 0.0005,
});
const routeLines = {
  r1: [
    [-8, -2],
    [-4, 3],
    [2, 1],
    [7, 3],
    [11, -1],
    [7, -6],
    [0, -4],
    [-6, -6],
    [-8, -2],
  ],
  r2: [
    [-1, 9],
    [2, 6],
    [0, 2],
    [4, -1],
    [8, -4],
  ],
  r3: [
    [-8, 7],
    [-2, 8],
    [1, 4],
    [-1, 0],
    [-7, 0],
    [-9, 4],
    [-8, 7],
  ],
};
// Match the original HTML territory game with a honeycomb grid.
const territories = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 7 }, (_, col) => {
    const radius = 1.45,
      r = row - 2,
      q = col - 3;
    const cx = Math.sqrt(3) * radius * (q + r / 2),
      cy = 1.5 * radius * r;
    return Array.from({ length: 6 }, (_, i) => {
      const angle = ((60 * i - 30) * Math.PI) / 180;
      return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
    });
  }),
).flat();

export default function MapScreen({ onToast }) {
  const mapRef = useRef(null);
  const [, setRunHistory] = useBackendState("runs", []);
  const [mode, setMode] = useState("live");
  const [selected, setSelected] = useState("r1");
  const [running, setRunning] = useState(null);
  const [shareLocation, setShareLocation] = useState(true);
  const [rally, setRally] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [tick, setTick] = useState(0);
  const [owners, setOwners] = useState(
    territories.map((_, index) => (index % 4) + 1),
  );
  React.useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [running]);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTick((value) => value + 1);
      setOwners((all) => {
        const next = [...all];
        const cell = tick % next.length;
        next[cell] = (next[cell] % 4) + 1;
        if (running) next[(tick + 3) % next.length] = ME;
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [tick, running]);
  const movingPoint = (routeId, progress) => {
    const line = routeLines[routeId];
    const scaled = Math.min(
      line.length - 1,
      Math.max(0, progress) * (line.length - 1),
    );
    const index = Math.floor(scaled);
    const rest = scaled - index;
    const a = line[index];
    const b = line[Math.min(line.length - 1, index + 1)];
    return coordinate(a[0] + (b[0] - a[0]) * rest, a[1] + (b[1] - a[1]) * rest);
  };
  const members = useMemo(
    () =>
      squad.map((person, index) => {
        const routeId =
          person.id === ME && running
            ? running.id
            : ["r3", "r1", "r3", "r2"][index];
        const progress =
          person.id === ME && running
            ? Math.min(1, seconds / running.record)
            : (tick * [0.003, 0.007, 0.004, 0.012][index]) % 1;
        return {
          ...person,
          coordinate:
            person.id === ME && !running
              ? coordinate(-5, -2)
              : movingPoint(routeId, progress),
          moving: person.id !== ME || Boolean(running),
        };
      }),
    [tick, running, seconds],
  );
  const focusMe = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        onToast("Location permission was not granted");
        return;
      }
      const here = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      mapRef.current?.animateToRegion({
        latitude: here.coords.latitude,
        longitude: here.coords.longitude,
        latitudeDelta: 0.018,
        longitudeDelta: 0.018,
      });
      onToast("Map centered on your location");
    } catch {
      onToast("Location is unavailable. Please try again outdoors.");
    }
  };
  const startRun = (route) => {
    setRunning(route);
    setSeconds(0);
    setMode("routes");
    onToast(`Racing ${route.name}’s ghost`);
  };
  const finishRun = () => {
    setRunHistory((all) =>
      [
        {
          id: `run-${Date.now()}`,
          routeId: running.id,
          seconds,
          completedAt: new Date().toISOString(),
        },
        ...all,
      ].slice(0, 100),
    );
    onToast(
      `Run finished · ${formatTime(seconds)} · +${Math.max(2, Math.round(seconds / 20))} hexes`,
    );
    setRunning(null);
    setSeconds(0);
  };
  const placeRally = (event) => {
    if (!placing) return;
    setRally(event.nativeEvent.coordinate);
    setPlacing(false);
    onToast("Rally point shared with the squad");
  };
  return (
    <View style={styles.page}>
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={campus}
          userInterfaceStyle="dark"
          customMapStyle={darkMapStyle}
          onPress={placeRally}
        >
          {territories.map((points, index) => {
            const owner = squad.find((person) => person.id === owners[index]);
            return (
              <Polygon
                key={index}
                coordinates={points.map(([x, y]) => coordinate(x, y))}
                fillColor={`${owner.color}35`}
                strokeColor={`${owner.color}a0`}
                strokeWidth={1}
              />
            );
          })}
          {Object.entries(routeLines).map(([id, line]) => (
            <Polyline
              key={id}
              coordinates={line.map(([x, y]) => coordinate(x, y))}
              strokeColor={
                id === selected || running?.id === id ? colors.lime : "#94a3b8"
              }
              strokeWidth={id === selected || running?.id === id ? 5 : 2}
              lineDashPattern={
                id === selected || running?.id === id ? undefined : [5, 7]
              }
            />
          ))}
          {members.map((person) =>
            person.id === 1 && !shareLocation ? null : (
              <Marker
                key={person.id}
                person={person}
                coordinate={person.coordinate}
                title={person.id === 1 ? "You" : person.name}
                description={person.moving ? "Running now" : "Resting"}
                pinColor={person.color}
              />
            ),
          )}
          {running && (
            <Marker
              coordinate={movingPoint(
                running.id,
                Math.min(1, seconds / Math.max(1, running.record - 40)),
              )}
              title="Ghost"
              description="Route record"
              pinColor="#f8fafc"
            />
          )}
          {rally && (
            <Marker
              coordinate={rally}
              title="6 PM squad run"
              description="Rally point"
              pinColor={colors.lime}
            />
          )}
        </MapView>
        <View style={styles.controls}>
          <View style={styles.modeSwitch}>
            {[
              ["live", "Live"],
              ["routes", "Routes"],
              ["territory", "Turf"],
            ].map(([id, label]) => (
              <Pressable
                accessibilityRole="button"
                key={id}
                onPress={() => setMode(id)}
                style={[styles.mode, mode === id && styles.modeActive]}
              >
                <Text
                  style={[
                    styles.modeText,
                    mode === id && styles.modeTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={focusMe}
            accessibilityLabel="Use my location"
            style={styles.locate}
          >
            <Text>📍</Text>
          </Pressable>
        </View>
        {placing && (
          <View style={styles.placing}>
            <Text style={styles.placingText}>
              Tap the map to drop your rally point
            </Text>
          </View>
        )}
        {running && (
          <View style={styles.runOverlay}>
            <View style={styles.runTop}>
              <Text style={styles.runLive}>● LIVE · {running.name}</Text>
              <Pressable accessibilityRole="button" onPress={finishRun}>
                <Text style={styles.end}>End run</Text>
              </Pressable>
            </View>
            <View style={styles.runStats}>
              <RunStat label="TIME" value={formatTime(seconds)} />
              <RunStat
                label="KM"
                value={(
                  Math.min(1, seconds / running.record) * running.km
                ).toFixed(2)}
              />
              <RunStat
                label="PACE"
                value={
                  seconds
                    ? `${Math.floor(seconds / Math.max(0.1, Math.min(1, seconds / running.record) * running.km) / 60)}:--`
                    : "—"
                }
              />
              <RunStat
                label="HEXES"
                value={`+${Math.max(0, Math.floor(seconds / 12))}`}
              />
            </View>
            <ProgressBar
              value={Math.min(100, (seconds / running.record) * 100)}
              color={colors.lime}
              height={6}
            />
          </View>
        )}
      </View>
      <ScrollView
        contentContainerStyle={styles.panel}
        style={styles.bottomPanel}
      >
        {mode === "live" && (
          <>
            <View style={styles.buttons}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPlacing((value) => !value)}
                style={[styles.button, placing && styles.buttonActive]}
              >
                <Text style={styles.buttonText}>
                  📍 {placing ? "Tap map…" : "Drop rally point"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShareLocation((value) => !value)}
                style={styles.button}
              >
                <Text style={styles.buttonText}>
                  {shareLocation ? "👁 Sharing location" : "🙈 Location hidden"}
                </Text>
              </Pressable>
            </View>
            {members.map((person) => (
              <View key={person.id} style={styles.member}>
                <Avatar person={person} size={34} />
                <View style={styles.memberCopy}>
                  <Text style={styles.memberName}>
                    {person.id === 1 ? "You" : person.name}
                  </Text>
                  <Text
                    style={[
                      styles.memberStatus,
                      { color: person.moving ? person.color : colors.dim },
                    ]}
                  >
                    {person.id === 1 && !shareLocation
                      ? "Hidden from squad"
                      : person.moving
                        ? "Running now"
                        : "Resting"}
                  </Text>
                </View>
                <Text style={[styles.hexes, { color: person.color }]}>
                  {owners.filter((owner) => owner === person.id).length} hexes
                </Text>
              </View>
            ))}
          </>
        )}
        {mode === "routes" &&
          !running &&
          routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              active={selected === route.id}
              onSelect={() => setSelected(route.id)}
              onRun={() => startRun(route)}
            />
          ))}
        {mode === "territory" && (
          <Card title="TERRITORY">
            <Text style={styles.turfCopy}>
              Live turf shifts as runners cross cells. Your current run captures
              cells in lime.
            </Text>
            {members.map((person) => (
              <View key={person.id} style={styles.turfRow}>
                <Avatar person={person} size={25} />
                <View style={styles.turfBar}>
                  <ProgressBar
                    value={
                      (owners.filter((owner) => owner === person.id).length /
                        territories.length) *
                      100
                    }
                    color={person.color}
                    height={7}
                  />
                </View>
                <Text style={[styles.turfNumber, { color: person.color }]}>
                  {owners.filter((owner) => owner === person.id).length}
                </Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
function RouteCard({ route, active, onSelect, onRun }) {
  const king = squad.find((person) => person.id === route.king);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onSelect}
      style={[styles.route, active && styles.routeActive]}
    >
      <View style={styles.routeTop}>
        <View>
          <Text style={styles.routeName}>{route.name}</Text>
          <Text style={styles.routeMeta}>
            {route.km} km · {route.elev} m climb
          </Text>
        </View>
        <View style={styles.king}>
          <Text style={styles.kingText}>👑 {king.name}</Text>
          <Text style={styles.routeMeta}>{formatTime(route.record)}</Text>
        </View>
      </View>
      {active && (
        <View style={styles.routeFooter}>
          <Text style={styles.routeMeta}>
            Your best{" "}
            <Text style={{ color: colors.accent, fontWeight: "900" }}>
              {formatTime(route.best)}
            </Text>
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onRun}
            style={styles.race}
          >
            <Text style={styles.raceText}>▶ Race the ghost</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}
function RunStat({ label, value }) {
  return (
    <View style={styles.runStat}>
      <Text style={styles.runValue}>{value}</Text>
      <Text style={styles.runLabel}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  mapWrap: { height: "54%", minHeight: 240 },
  map: { ...StyleSheet.absoluteFillObject },
  controls: {
    position: "absolute",
    top: 13,
    left: 13,
    right: 13,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modeSwitch: {
    flexDirection: "row",
    flex: 1,
    maxWidth: 270,
    backgroundColor: "rgba(5,7,10,.86)",
    padding: 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.12)",
  },
  mode: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 11 },
  modeActive: { backgroundColor: colors.lime },
  modeText: { color: "#cbd5e1", fontSize: 11, fontWeight: "900" },
  modeTextActive: { color: "#030508" },
  locate: {
    width: 43,
    height: 43,
    borderRadius: 13,
    marginLeft: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,7,10,.86)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.12)",
  },
  placing: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    backgroundColor: colors.lime,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 18,
  },
  placingText: { fontSize: 11, fontWeight: "900", color: "#030508" },
  runOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(3,5,8,.9)",
    borderWidth: 1,
    borderColor: "rgba(200,255,0,.45)",
    borderRadius: 18,
    padding: 12,
  },
  runTop: { flexDirection: "row", justifyContent: "space-between" },
  runLive: { fontSize: 10, fontWeight: "900", color: colors.lime },
  end: { color: colors.rose, fontWeight: "900", fontSize: 11 },
  runStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  runStat: { alignItems: "center", flex: 1 },
  runValue: { color: "#F5F5EF", fontSize: 15, fontWeight: "900" },
  runLabel: { color: colors.dim, fontSize: 8, fontWeight: "900", marginTop: 3 },
  bottomPanel: { flex: 1 },
  panel: { padding: 14, gap: 9, paddingBottom: 20 },
  buttons: { flexDirection: "row", gap: 8 },
  button: {
    flex: 1,
    padding: 11,
    borderRadius: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  buttonActive: { backgroundColor: colors.lime, borderColor: colors.lime },
  buttonText: { color: colors.text, fontSize: 10, fontWeight: "900" },
  member: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberCopy: { flex: 1 },
  memberName: { color: colors.text, fontSize: 12, fontWeight: "900" },
  memberStatus: { fontSize: 10, fontWeight: "700", marginTop: 2 },
  hexes: { fontSize: 11, fontWeight: "900" },
  route: {
    padding: 14,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  routeActive: {
    borderColor: "rgba(200,255,0,.5)",
    backgroundColor: "rgba(200,255,0,.05)",
  },
  routeTop: { flexDirection: "row", justifyContent: "space-between" },
  routeName: { color: colors.text, fontWeight: "900", fontSize: 14 },
  routeMeta: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3,
  },
  king: { alignItems: "flex-end" },
  kingText: { color: colors.amber, fontSize: 10, fontWeight: "900" },
  routeFooter: {
    borderTopWidth: 1,
    borderColor: colors.border,
    marginTop: 12,
    paddingTop: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  race: {
    backgroundColor: colors.lime,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  raceText: { color: "#030508", fontWeight: "900", fontSize: 10 },
  turfCopy: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  turfRow: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 8 },
  turfBar: { flex: 1 },
  turfNumber: {
    fontSize: 11,
    fontWeight: "900",
    width: 22,
    textAlign: "right",
  },
});
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
];
