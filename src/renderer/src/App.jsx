import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import Personalization from './components/Personalization';
import PrinterConfiguration from './components/PrinterConfiguration';
import TopBar from './components/TopBar';
// import checkStoredData from './utils/getStoredData';
import { useSocket } from './utils/useSocket';
import getUser from './utils/getUser';
import Modal from './components/Modal';
import Toast from './components/Toast';
// import readLogs from './utils/readLogs';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeScreen, setActiveScreen] = useState('printers');
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [logs, setLogs] = useState('');


  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser(); 
      if (userData?.user) {
        handleLoginSuccess(userData.user.user); 
      }
    };
    fetchUser(); 
  }, []);

  const handleLoginSuccess = (user) => {
    console.log('User logged in:', user);
    setIsLoggedIn(true);
    setUser(user); // Directly setting user
  };

  // Use the custom hook for socket connection
  const { isConnected, socket, toastMessage, setToastMessage } = useSocket(user?._id);

  useEffect(() => {
    if (socket) {
      socket.on('orderUpdate', (newOrder) => {
        console.log('Order update received:', newOrder);
        // Handle the order update globally or pass it to a specific component
        setToastMessage('Nuevo pedido recibido'); // Show toast when a new order is received
        // Handle the order update
      });

      socket.on('printJobStart', () => {
        setToastMessage('Enviando impresión...'); // Show toast when a print job starts
      });

      socket.on('printJobSuccess', () => {
        setToastMessage('Impresión aceptada y en proceso...'); // Show toast when a print job is successful
      });
    }

    return () => {
      if (socket) {
        socket.off('orderUpdate');
      }
    };
  }, [socket]);

  useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
      const unsubscribeLogs = window.electron.ipcRenderer.on('show-logs', () => {
        setShowLogsModal(true);
      });
  
      const unsubscribeTerms = window.electron.ipcRenderer.on('show-terms', () => {
        setShowTermsModal(true);
      });
  
      // Clean up listeners on component unmount
      return () => {
        unsubscribeLogs();
        unsubscribeTerms();
      };
    } else {
      console.error('ipcRenderer is not available.');
    }
  }, []);
  

  return (
    <div className="App max-w-[70vw]">
      { isLoggedIn && <TopBar isConnected={isConnected} socket={socket}/>}
      {isLoggedIn ? (
        <div className='min-h-full overflow-auto'>
          <Header setActiveScreen={setActiveScreen} />
          {/* <h1 className="text-3xl font-bold mb-6">Bienvenido a PideFácil Printer App</h1> */}
            {activeScreen === 'printers' && <PrinterConfiguration user={user} setToastMessage={setToastMessage}/>}
            {activeScreen === 'customization' && <Personalization user={user} />}
        </div>
      ) : (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      )}

       {showLogsModal && (
        <Modal onClose={() => setShowLogsModal(false)} title="Application Logs">
          <div className="logs-content whitespace-pre-wrap overflow-y-auto max-h-96">
            {logs}
          </div>
        </Modal>
      )}

      {showTermsModal && (
        <Modal onClose={() => setShowTermsModal(false)} title="Terms and Conditions">
          {/* Your terms and conditions content here */}
        </Modal>
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')} // Hide the toast after 3 seconds or when closed
        />
      )}
    </div>
  );
}

export default App;
