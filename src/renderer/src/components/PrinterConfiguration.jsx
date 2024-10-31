import React, { useState, useEffect } from 'react';
import { FiEdit3, FiLock, FiUnlock } from 'react-icons/fi';
import sampleTicketInfo from '../utils/sampleTicketInfo';
import logoutUser from '../utils/logoutUser'
import { formatTicket } from '../utils/formatTicket';
import { generatePDF } from '../utils/generatePDF';

const PrinterConfiguration = ( { setToastMessage} ) => {
  const [printers, setPrinters] = useState([{ id: 1, name: '', options: { paperSize: '80mm', locked: false } }]);
  const [availablePrinters, setAvailablePrinters] = useState([]);

  useEffect(() => {
    window.electron.getAvailablePrinters()
      .then(setAvailablePrinters)
      .catch(console.error);

    // Load saved printers from the store
    window.electron.store.get('printers').then((savedPrinters) => {
      if (savedPrinters) {
        setPrinters(savedPrinters);
      }
    });
  }, []);

  const savePrintersToStore = (updatedPrinters) => {
    setPrinters(updatedPrinters);
    window.electron.store.set('printers', updatedPrinters);
  };

  const addPrinter = () => {
    const newPrinter = {
      id: printers.length + 1,
      name: '',
      options: { paperSize: '80mm', locked: false },
    };
    savePrintersToStore([...printers, newPrinter]);
  };

  const removePrinter = (id) => {
    const updatedPrinters = printers.filter((printer) => printer.id !== id);
    savePrintersToStore(updatedPrinters);
  };

  const updatePrinterName = (id, name) => {
    const updatedPrinters = printers.map((printer) =>
      printer.id === id ? { ...printer, name } : printer
    );
    savePrintersToStore(updatedPrinters);
  };

  const toggleEditLock = (id) => {
    const updatedPrinters = printers.map((printer) =>
      printer.id === id ? { ...printer, options: { ...printer.options, locked: !printer.options.locked } } : printer
    );
    savePrintersToStore(updatedPrinters);
  };

  const updateOption = (id, option) => {
    const updatedPrinters = printers.map((printer) =>
      printer.id === id
        ? { ...printer, options: { ...printer.options, [option]: !printer.options[option] } }
        : printer
    );
    savePrintersToStore(updatedPrinters);
  };

  const updatePaperSize = (id, paperSize) => {
    const updatedPrinters = printers.map((printer) =>
      printer.id === id ? { ...printer, options: { ...printer.options, paperSize } } : printer
    );
    savePrintersToStore(updatedPrinters);
  };

  const updatePrintingMethod = (id, method) => {
    const updatedPrinters = printers.map((printer) =>
      printer.id === id ? { ...printer, options: { ...printer.options, printingMethod: method } } : printer
    );
    savePrintersToStore(updatedPrinters);
  };

  const printTest = async (printerId) => {
    const printer = printers.find((p) => p.id === printerId);
    if (printer && printer.name) {
      try {
        setToastMessage('Enviando impresión de prueba...');
  
        if (printer.options.printingMethod === 'raw') {
          // Format the ticket content
          const ticketContent = await formatTicket(sampleTicketInfo, printer.options);
          console.log('Formatted ticket content:', ticketContent);
  
          // Print the ticket content
          if (typeof ticketContent === 'string') {
            console.log('Sending ticket content to printer...');
            await window.electron.printToPrinter(printer.name, ticketContent);
            setToastMessage('Impresión aceptada... Imprimiendo....');
            console.log('Ticket content sent to printer');
          } else {
            console.error('Formatted ticket content is not a string');
            setToastMessage('Error: Formato del ticket no es un string');
          }
        } else if (printer.options.printingMethod === 'thermal') {
          // Method 2: Thermal Printer (Using node-thermal-printer)
  
          const data = [
            {
              type: 'text',
              value: 'Prueba de Impresión',
              style: { fontWeight: '700', textAlign: 'center', fontSize: 6 },
            },
            {
              type: 'text',
              value: 'Este es un test de la impresora térmica.',
              style: { fontSize: 4, textAlign: 'left' },
            },
            {
              type: 'text',
              value: 'Muchas gracias por usar nuestro servicio.',
              style: { fontSize: 3, textAlign: 'left' },
            },
            // You can add more content like images, QR codes, barcodes, etc.
          ];
  
          console.log('Sending thermal print data to printer...');
          await window.electron.printToPrinterThermal(printer.name, data);
          setToastMessage('Impresión térmica aceptada... Imprimiendo....');
          console.log('Thermal print data sent to printer');
        }
      } catch (error) {
        console.error('Error formatting or printing the ticket:', error);
        setToastMessage(`Error formateando o imprimiendo el ticket: ${error.message}`);
      }
    } else {
      console.error('Printer not found or name is missing');
      setToastMessage('Error: La impresora no está disponible');
    }
  };
  

  return (
    <div className="printer-configurations p-4">
      <h2 className="text-2xl font-semibold mb-4">Configuración de Impresoras</h2>
      <div className="flex overflow-x-auto gap-4">
        {printers.map((printer) => (
          <div key={printer.id} className="card bg-white shadow-md p-4 mb-4 rounded-md min-w-[260px]">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                {printer.options.locked ? (
                  <span className="text-xl font-semibold">
                    {printer.name || `Impresora ${printer.id}`}
                  </span>
                ) : (
                  <input
                    type="text"
                    value={printer.name}
                    onChange={(e) => updatePrinterName(printer.id, e.target.value)}
                    className="input input-md rounded-md text-lg font-semibold"
                    placeholder={`Impresora ${printer.id}`}
                  />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => toggleEditLock(printer.id)} className="text-xl">
                  {printer.options.locked ? <FiLock /> : <FiUnlock />}
                </button>
                {printer.options.locked && (
                  <button onClick={() => toggleEditLock(printer.id)} className="text-xl">
                    <FiEdit3 />
                  </button>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="label">Selecciona una impresora</label>
              <select
                value={printer.name}
                onChange={(e) => updatePrinterName(printer.id, e.target.value)}
                className="select select-bordered w-full rounded-md"
                disabled={printer.options.locked}
              >
                <option value="">Selecciona una impresora</option>
                {availablePrinters.map((p, index) => (
                  <option key={index} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="label">Tamaño del papel</label>
              <select
                value={printer.options.paperSize}
                onChange={(e) => updatePaperSize(printer.id, e.target.value)}
                className="select select-bordered w-full rounded-md"
                disabled={printer.options.locked}
              >
                <option value="80mm">80mm</option>
                <option value="58mm">58mm</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="label">Método de Impresión</label>
              <select
                value={printer.options.printingMethod}
                onChange={(e) => updatePrintingMethod(printer.id, e.target.value)}
                className="select select-bordered w-full rounded-md"
                disabled={printer.options.locked}
              >
                <option value="raw">Método 1 (Raw Data)</option>
                <option value="thermal">Método 2 (Thermal Commands)</option>
              </select>
            </div>

            <label className="label w-full">Incluir:</label>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* <label className="cursor-pointer flex flex-row items-center">
                <input
                  type="checkbox"
                  checked={printer.options.logo || false}
                  onChange={() => updateOption(printer.id, 'logo')}
                  className="checkbox mr-2 rounded-md"
                  disabled={printer.options.locked}
                />
                Logo
              </label> */}
              <label className="cursor-pointer flex flex-row items-center">
                <input
                  type="checkbox"
                  checked={printer.options.productos || false}
                  onChange={() => updateOption(printer.id, 'productos')}
                  className="checkbox mr-2 rounded-md"
                  disabled={printer.options.locked}
                />
                Productos
              </label>
              <label className="cursor-pointer flex flex-row items-center">
                <input
                  type="checkbox"
                  checked={printer.options.datosCliente || false}
                  onChange={() => updateOption(printer.id, 'datosCliente')}
                  className="checkbox mr-2 rounded-md"
                  disabled={printer.options.locked}
                />
                Datos del Cliente
              </label>
              <label className="cursor-pointer flex flex-row items-center">
                <input
                  type="checkbox"
                  checked={printer.options.subtotalTotal || false}
                  onChange={() => updateOption(printer.id, 'subtotalTotal')}
                  className="checkbox mr-2 rounded-md"
                  disabled={printer.options.locked}
                />
                Subtotal y Total
              </label>
              {/* <label className="cursor-pointer flex flex-row items-center">
                <input
                  type="checkbox"
                  checked={printer.options.codigoQR || false}
                  onChange={() => updateOption(printer.id, 'codigoQR')}
                  className="checkbox mr-2 rounded-md"
                  disabled={printer.options.locked}
                />
                Código QR
              </label> */}
              <label className="cursor-pointer flex flex-row items-center">
                <input
                  type="checkbox"
                  checked={printer.options.footerText || false}
                  onChange={() => updateOption(printer.id, 'footerText')}
                  className="checkbox mr-2 rounded-md"
                  disabled={printer.options.locked}
                />
                Texto de Pie de Página
              </label>
            </div>

            <button
              onClick={() => printTest(printer.id)}
              className="btn btn-secondary btn-sm mb-4 bg-main text-white mt-4 border-main"

            >
              Imprimir Prueba
            </button>
            <button
              onClick={() => removePrinter(printer.id)}
              className="btn btn-sm btn-outline"
              disabled={printer.options.locked}
            >
              Eliminar esta impresora
            </button>
          </div>
        ))}
      </div>
      <button onClick={addPrinter} className="btn btn-primary mt-4">
        Añadir Impresora
      </button>
      <div onClick={() => logoutUser()} className='mt-8 underline text-center cursor-pointer'>Cerrar sesión</div>
    </div>
  );
};

export default PrinterConfiguration;
