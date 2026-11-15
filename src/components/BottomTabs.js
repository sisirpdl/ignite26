import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';

const tabs = [
  ['dashboard', 'Home', 'grid-outline'], ['leaderboard', 'Ranks', 'podium-outline'],
  ['chat', 'Squad', 'chatbubbles-outline'], ['map', 'Map', 'map-outline']
];

export default function BottomTabs({ active, onChange, unread }) {
  return <View style={styles.wrap}>{tabs.map(([key, label, icon]) => {
    const selected = active === key;
    return <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={label} onPress={() => onChange(key)} style={[styles.tab, selected && styles.active]}>
      <View>{<Ionicons name={icon} size={22} color={selected ? '#a5f3fc' : colors.dim} />}{key === 'chat' && unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{unread}</Text></View>}</View>
      <Text style={[styles.label, selected && styles.activeLabel]}>{label}</Text>
    </Pressable>;
  })}</View>;
}
const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', marginHorizontal: 12, marginBottom: 10, padding: 6, borderRadius: 24, backgroundColor: '#0b111d', borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 18 }, active: { backgroundColor: 'rgba(34,211,238,.13)', borderWidth: 1, borderColor: 'rgba(34,211,238,.25)' },
  label: { marginTop: 3, color: colors.dim, fontSize: 10, fontWeight: '800' }, activeLabel: { color: '#a5f3fc' },
  badge: { position: 'absolute', right: -9, top: -5, backgroundColor: colors.rose, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, badgeText: { color: 'white', fontSize: 9, fontWeight: '900' }
});
