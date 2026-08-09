import { useState, useEffect } from 'react';
import { socket } from '../services/socket';

export const useSocket = () => {
  const [connectionState, setConnectionState] = useState(
    socket.connected ? 'connected' : 'offline'
  );

  useEffect(() => {
    const onConnect = () => {
      setConnectionState('connected');
    };

    const onDisconnect = (reason) => {
      if (reason === 'io client disconnect') {
        setConnectionState('offline');
      } else {
        setConnectionState('reconnecting');
      }
    };

    const onConnectError = () => {
      setConnectionState('reconnecting');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  return { socket, connectionState };
};
