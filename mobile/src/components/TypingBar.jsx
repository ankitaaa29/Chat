import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TypingBar = ({ typingUsers = [] }) => {
  if (typingUsers.length === 0) return null;

  let text = '';
  if (typingUsers.length === 1) {
    text = `${typingUsers[0]} is typing...`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0]} & ${typingUsers[1]} are typing...`;
  } else {
    text = `${typingUsers[0]} and others are typing...`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#090D16',
  },
  text: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
});
