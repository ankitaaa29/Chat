import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, VolumeX, Shield, User } from 'lucide-react';
import { socket } from '../services/socket';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export const CallModal = ({
  callState, // { isCalling, isReceivingCall, callerName, callType, callerSocketId, roomId }
  onCloseCall,
  currentUsername,
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [inCall, setInCall] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const durationTimerRef = useRef(null);

  useEffect(() => {
    if (inCall) {
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    }

    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [inCall]);

  // Handle incoming signaling events
  useEffect(() => {
    const handleCallAccepted = async ({ answer }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setInCall(true);
        }
      } catch (err) {
        console.error('Error handling call accepted:', err);
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      try {
        if (peerConnectionRef.current && candidate) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    };

    const handleCallEnded = () => {
      cleanUpCall();
      onCloseCall();
    };

    const handleCallRejected = () => {
      cleanUpCall();
      onCloseCall();
      alert('Call was declined or unanswered.');
    };

    socket.on('call_accepted', handleCallAccepted);
    socket.on('ice_candidate', handleIceCandidate);
    socket.on('call_ended', handleCallEnded);
    socket.on('call_rejected', handleCallRejected);

    return () => {
      socket.off('call_accepted', handleCallAccepted);
      socket.off('ice_candidate', handleIceCandidate);
      socket.off('call_ended', handleCallEnded);
      socket.off('call_rejected', handleCallRejected);
    };
  }, [onCloseCall]);

  // Auto-initiate outgoing call if isCalling is true
  useEffect(() => {
    if (callState.isCalling && !inCall && !peerConnectionRef.current) {
      initiateOutgoingCall();
    }
  }, [callState.isCalling]);

  const initiateOutgoingCall = async () => {
    try {
      const isVideo = callState.callType === 'video';
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current && isVideo) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (e) => {
        if (remoteVideoRef.current && e.streams[0]) {
          remoteVideoRef.current.srcObject = e.streams[0];
        }
      };

      pc.onicecandidate = (e) => {
        if (e.candidate && callState.callerSocketId) {
          socket.emit('ice_candidate', {
            to: callState.callerSocketId,
            candidate: e.candidate,
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call_user', {
        userToCall: callState.userToCall,
        offer,
        callType: callState.callType,
        callerName: currentUsername,
        roomId: callState.roomId,
      });
    } catch (err) {
      console.error('Failed to initiate outgoing call:', err);
      alert('Unable to access microphone or camera for call.');
      onCloseCall();
    }
  };

  const handleAcceptCall = async () => {
    try {
      const isVideo = callState.callType === 'video';
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current && isVideo) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (e) => {
        if (remoteVideoRef.current && e.streams[0]) {
          remoteVideoRef.current.srcObject = e.streams[0];
        }
      };

      pc.onicecandidate = (e) => {
        if (e.candidate && callState.from) {
          socket.emit('ice_candidate', {
            to: callState.from,
            candidate: e.candidate,
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(callState.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer_call', {
        to: callState.from,
        answer,
      });

      setInCall(true);
    } catch (err) {
      console.error('Failed to accept incoming call:', err);
      alert('Unable to access media device to answer call.');
      onCloseCall();
    }
  };

  const handleDeclineCall = () => {
    if (callState.from) {
      socket.emit('reject_call', { to: callState.from });
    }
    cleanUpCall();
    onCloseCall();
  };

  const handleEndCall = () => {
    if (callState.callerSocketId || callState.from) {
      socket.emit('end_call', {
        to: callState.callerSocketId || callState.from,
        roomId: callState.roomId,
      });
    }
    cleanUpCall();
    onCloseCall();
  };

  const cleanUpCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setInCall(false);
  };

  const toggleMuteMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOff(!videoTrack.enabled);
      }
    }
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!callState.isCalling && !callState.isReceivingCall && !inCall) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 7, 15, 0.92)',
        backdropFilter: 'blur(20px)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* 1. Incoming Call Toast Card */}
      {callState.isReceivingCall && !inCall && (
        <div
          className="animate-fade-in glass-panel"
          style={{
            width: '100%',
            maxWidth: '400px',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: 'var(--shadow-aurora)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--aurora-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: '16px',
              boxShadow: '0 0 24px rgba(168, 85, 247, 0.5)',
            }}
          >
            {callState.callType === 'video' ? <Video size={36} /> : <Phone size={36} />}
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
            {callState.callerName}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '28px' }}>
            Incoming {callState.callType === 'video' ? 'Video' : 'Voice'} Call...
          </p>

          <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
            <button
              onClick={handleDeclineCall}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#EF4444',
                fontWeight: '700',
                fontSize: '0.925rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <PhoneOff size={18} />
              <span>Decline</span>
            </button>

            <button
              onClick={handleAcceptCall}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#10B981',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: '700',
                fontSize: '0.925rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Phone size={18} />
              <span>Accept</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Active Call Stream Container */}
      {(inCall || callState.isCalling) && (
        <div
          className="animate-fade-in glass-panel"
          style={{
            width: '100%',
            maxWidth: '920px',
            height: '620px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Top Bar Overlay */}
          <div
            style={{
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(13, 18, 36, 0.85)',
              borderBottom: '1px solid var(--border-color)',
              zIndex: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={18} color="var(--accent-green)" />
              <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>
                {callState.callerName || callState.userToCall || 'Encrypted Channel Call'}
              </span>
            </div>

            <div
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                color: 'var(--primary)',
                fontWeight: '600',
                fontSize: '0.85rem',
              }}
            >
              {inCall ? formatDuration(callDuration) : 'Ringing...'}
            </div>
          </div>

          {/* Video Stream Viewport */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              backgroundColor: '#05070F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Remote Main Video Stream */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {!inCall && (
              <div
                style={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'var(--aurora-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: '#FFFFFF',
                    boxShadow: 'var(--shadow-aurora)',
                  }}
                >
                  <User size={38} />
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>
                  Calling {callState.userToCall || 'channel'}...
                </span>
              </div>
            )}

            {/* Local Camera PIP Video Stream */}
            {callState.callType === 'video' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  width: '200px',
                  height: '140px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '2px solid var(--border-glow)',
                  boxShadow: 'var(--shadow-md)',
                  backgroundColor: '#000000',
                  zIndex: 10,
                }}
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}
          </div>

          {/* Bottom Action Controls Bar */}
          <div
            style={{
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              backgroundColor: 'rgba(13, 18, 36, 0.95)',
              borderTop: '1px solid var(--border-color)',
              zIndex: 20,
            }}
          >
            {/* Mic Toggle */}
            <button
              onClick={toggleMuteMic}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: micMuted ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                border: micMuted ? '1px solid #EF4444' : '1px solid var(--border-color)',
                color: micMuted ? '#EF4444' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={micMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {micMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* Camera Toggle */}
            {callState.callType === 'video' && (
              <button
                onClick={toggleCamera}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: cameraOff ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  border: cameraOff ? '1px solid #EF4444' : '1px solid var(--border-color)',
                  color: cameraOff ? '#EF4444' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title={cameraOff ? 'Turn On Camera' : 'Turn Off Camera'}
              >
                {cameraOff ? <VideoOff size={20} /> : <Video size={20} />}
              </button>
            )}

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
              }}
              title="End Call"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
