import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';

export default function Avatar({ person, size = 40 }) {
  const [failed, setFailed] = useState(false);
  const uri = `https://api.dicebear.com/9.x/adventurer/png?seed=${encodeURIComponent(person.avatar)}&backgroundColor=${person.color.replace('#', '')}&radius=50`;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: person.color, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: person.color }}>
      {failed ? <Text style={{ color: '#030508', fontSize: size * 0.42, fontWeight: '900' }}>{person.name[0]}</Text> : <Image accessibilityLabel={`${person.name} avatar`} onError={() => setFailed(true)} source={{ uri }} style={{ width: size, height: size }} />}
    </View>
  );
}
