import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

export const CallModal = ({
  visible,
  callType = 'video', // 'audio' | 'video'
  targetUser = 'Contact',
  isIncoming = false,
  onAcceptCall,
  onEndCall,
}) => {
  const [callStatus, setCallStatus] = useState(isIncoming ? 'Incoming Call...' : 'Ringing...');
  const [inCall, setInCall] = useState(!isIncoming);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);

  useEffect(() => {
    if (!visible) {
      setDurationSeconds(0);
      setCallStatus(isIncoming ? 'Incoming Call...' : 'Ringing...');
      setInCall(!isIncoming);
      return;
    }

    if (isIncoming) {
      setCallStatus('Incoming Call...');
      setInCall(false);
    } else {
      setCallStatus('Ringing...');
      setInCall(true);
      const connectTimer = setTimeout(() => {
        setCallStatus('Connected (Encrypted)');
      }, 2000);

      return () => clearTimeout(connectTimer);
    }
  }, [visible, isIncoming]);

  useEffect(() => {
    let interval = null;
    if (visible && inCall) {
      interval = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, inCall]);

  const handleAccept = () => {
    setInCall(true);
    setCallStatus('Connected (Encrypted)');
    if (onAcceptCall) onAcceptCall();
  };

  const formatCallTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Call Header */}
        <View style={styles.header}>
          <Text style={styles.callTypeTitle}>
            {callType === 'video' ? '📹 Encrypted Video Call' : '📞 Encrypted Voice Call'}
          </Text>
          <Text style={styles.statusText}>{callStatus}</Text>
          {inCall && callStatus.includes('Connected') && (
            <Text style={styles.timerText}>{formatCallTimer(durationSeconds)}</Text>
          )}
        </View>

        {/* User Avatar / Camera Stream Display */}
        <View style={styles.videoStreamArea}>
          {callType === 'video' && !isVideoOff && inCall ? (
            <View style={styles.videoBox}>
              <Text style={styles.videoPlaceholderText}>📹 Live HD Camera Stream</Text>
              <Text style={styles.videoUserSub}>{targetUser}</Text>
            </View>
          ) : (
            <View style={styles.audioAvatarBox}>
              <View style={styles.largeAvatar}>
                <Text style={styles.largeAvatarText}>
                  {targetUser ? targetUser.charAt(0).toUpperCase() : 'C'}
                </Text>
              </View>
              <Text style={styles.targetName}>{targetUser}</Text>
              <Text style={styles.encryptionBadge}>🔒 End-to-End Encrypted</Text>
            </View>
          )}
        </View>

        {/* Call Controls Bar */}
        {isIncoming && !inCall ? (
          <View style={styles.incomingControlsBar}>
            <TouchableOpacity style={styles.declineCallBtn} onPress={onEndCall}>
              <Text style={styles.btnIcon}>📞</Text>
              <Text style={styles.btnLabel}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.acceptCallBtn} onPress={handleAccept}>
              <Text style={styles.btnIcon}>📞</Text>
              <Text style={styles.btnLabel}>Accept</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.controlsBar}>
            <TouchableOpacity
              style={[styles.controlBtn, isMuted ? styles.controlBtnActive : null]}
              onPress={() => setIsMuted((prev) => !prev)}
            >
              <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🎙️'}</Text>
              <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
            </TouchableOpacity>

            {callType === 'video' && (
              <TouchableOpacity
                style={[styles.controlBtn, isVideoOff ? styles.controlBtnActive : null]}
                onPress={() => setIsVideoOff((prev) => !prev)}
              >
                <Text style={styles.controlIcon}>{isVideoOff ? '🚫' : '📷'}</Text>
                <Text style={styles.controlLabel}>{isVideoOff ? 'Video On' : 'Video Off'}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.endCallBtn} onPress={onEndCall}>
              <Text style={styles.endCallIcon}>📞</Text>
              <Text style={styles.endCallLabel}>End Call</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070F',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  callTypeTitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statusText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  timerText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  videoStreamArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  videoBox: {
    width: '90%',
    height: 320,
    backgroundColor: '#0D1224',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  videoPlaceholderText: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  videoUserSub: {
    color: '#94A3B8',
    fontSize: 14,
  },
  audioAvatarBox: {
    alignItems: 'center',
  },
  largeAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  largeAvatarText: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '800',
  },
  targetName: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  encryptionBadge: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  incomingControlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  acceptCallBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  declineCallBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  btnIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  btnLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 30,
  },
  controlBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#121930',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
  },
  controlIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  controlLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
  },
  endCallBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  endCallIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    transform: [{ rotate: '135deg' }],
  },
  endCallLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
});
