import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabs from './components/BottomTabs';
import DashboardScreen from './screens/DashboardScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import ChatScreen from './screens/ChatScreen';
import MapScreen from './screens/MapScreen';
import ProfileScreen from './screens/ProfileScreen';
import { ME, squad } from './constants/data';
import { dailyMetrics } from './utils/metrics';
import { colors } from './styles/theme';

export default function ClutchApp({ preferences, onPreferencesChange }) {
  const [tab, setTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState('');
  const metrics = dailyMetrics();
  const openProfile = (person = squad.find((member) => member.id === ME)) => setProfile(person);
  const flash = (message) => { setToast(message); };
  useEffect(() => { if (!toast) return undefined; const id = setTimeout(() => setToast(''), 2400); return () => clearTimeout(id); }, [toast]);
  const changeTab = (nextTab) => {
    setTab(nextTab);
    if (nextTab === 'chat') setUnread(0);
  };
  const safePreferences = { group: 'g1', ...preferences };
  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    <View style={styles.app}>
      <View style={styles.content}>
        {tab === 'dashboard' && <DashboardScreen metrics={metrics} onOpenProfile={openProfile} onTabChange={setTab} onToast={flash} />}
        {tab === 'leaderboard' && <LeaderboardScreen onProfile={openProfile} />}
        {tab === 'chat' && <ChatScreen onUnread={setUnread} onProfile={openProfile} onToast={flash} />}
        {tab === 'map' && <MapScreen onToast={flash} />}
      </View>
      <BottomTabs active={tab} onChange={changeTab} unread={unread} />
      {toast ? <View pointerEvents="none" style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View> : null}
      <ProfileScreen visible={Boolean(profile)} person={profile} onClose={() => setProfile(null)} preferences={safePreferences} onPreferencesChange={onPreferencesChange} />
    </View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.bg }, app: { flex: 1, backgroundColor: colors.bg }, content: { flex: 1 }, toast: { position: 'absolute', bottom: 86, alignSelf: 'center', backgroundColor: '#f8fafc', borderRadius: 22, paddingVertical: 11, paddingHorizontal: 16, shadowColor: '#000', shadowOpacity: .4, shadowRadius: 16, elevation: 6 }, toastText: { color: '#030508', fontSize: 12, fontWeight: '900' } });
