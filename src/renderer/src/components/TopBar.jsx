import React, { useEffect, useState } from 'react';

function TopBar({ isConnected, socket }) {
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    const fetchVersion = async () => {
      const version = await window.electron.getAppVersion();
      setAppVersion(version);
    };
    fetchVersion();
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-gray-800 text-white flex items-center justify-between px-4 bg-stone-500 z-20">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
      </div>
      <div>
        <span>Versión: {appVersion}</span>
      </div>
    </div>
  );
}

export default TopBar;
