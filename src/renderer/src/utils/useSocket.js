import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { formatTicket } from '../utils/formatTicket';

export const useSocket = (userId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [toastMessage, setToastMessage] = useState(''); // State for toast messages

  useEffect(() => {
    if (!userId) return;

    const socketInstance = io('https://api.pidefacil.app');

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to socket:', socketInstance.id);
      socketInstance.emit('joinUser', userId);
    });

    socketInstance.on('connect_error', (err) => {
      setIsConnected(false);
      console.error('Socket connection error:', err);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from socket:', socketInstance.id);
    });

    const handleOrderUpdate = async (newOrder) => {
      try {
        setToastMessage('Nuevo Pedido Recibido'); // Show toast when a new order is received

        // Fetch the printers' configurations from the store
        const printers = await window.electron.store.get('printers');

        if (!printers) return;

        for (const printer of printers) {
          if (printer.name) {
            const printContent = await formatTicket(newOrder, printer.options);

            if (typeof printContent === 'string') {
              setToastMessage('Enviando trabajo a impresora...'); // Show toast when a print job starts
              window.electron.printToPrinter(printer.name, printContent);
              setToastMessage('Trabajo de impresión aceptado e imprimiendo...'); // Show toast when a print job is successful
            } else {
              console.error('Formatted ticket content is not a string');
            }
          }
        }
      } catch (error) {
        console.error('Error handling order update:', error);
      }
    };

    socketInstance.on('orderUpdate', handleOrderUpdate);

    setSocket(socketInstance);

    return () => {
      socketInstance.off('orderUpdate', handleOrderUpdate);
      socketInstance.disconnect();
    };
  }, [userId]);

  return { isConnected, socket, toastMessage, setToastMessage };
};
