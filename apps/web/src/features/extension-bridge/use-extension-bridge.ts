'use client';

import { useState, useEffect } from 'react';

export function useExtensionBridge() {
  const [isExtensionInstalled, setIsExtensionInstalled] = useState<boolean>(false);
  const [extensionVersion, setExtensionVersion] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.source === 'QADDEM_EXTENSION' && event.data?.type === 'PONG') {
        setIsExtensionInstalled(true);
        setExtensionVersion(event.data.payload?.version || '1.4.0');
      }
    };

    window.addEventListener('message', handleMessage);

    // Ping extension
    window.postMessage({ source: 'QADDEM_WEB', type: 'PING' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return {
    isExtensionInstalled,
    extensionVersion,
    pingExtension: () => window.postMessage({ source: 'QADDEM_WEB', type: 'PING' }, '*')
  };
}
