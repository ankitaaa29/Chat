import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ConnectionStatus = ({ state }) => {
  let badgeBg = 'rgba(16, 185, 129, 0.15)';
  let dotColor = '#10B981';
  let label = 'Live';

  if (state === 'reconnecting') {
    badgeBg = 'rgba(245, 158, 11, 0.15)';
    dotColor = '#F59E0B';
    label = 'Reconnecting...';
  } else if (state === 'offline') {
    badgeBg = 'rgba(239, 68, 68, 0.15)';
    dotColor = '#EF4444';
    label = 'Offline';
  }

  return (
    <View style={[styles.container, { backgroundColor: badgeBg }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.text, { color: dotColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
