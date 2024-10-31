import { ipcRenderer } from 'electron';

async function printThermalTicket() {
  try {
    const printers = await ipcRenderer.invoke('service-printer-list');
    const selectedPrinter = printers[0]; // Replace with your preferred printer selection logic

    const data = [
      {
        type: 'text',
        value: 'This is a test print.',
        style: { fontWeight: '700', textAlign: 'center', fontSize: '24px' },
      },
    ];

    const options = {
      printerName: selectedPrinter.name, // Use the printer name from the list
      copies: 1,
      silent: true,
      preview: false,
      margin: '0 0 0 0',
      pageSize: '80mm',
    };

    const response = await ipcRenderer.invoke('service-printer-print', { data, options });
    if (response.success) {
      console.log('Print job completed successfully');
    } else {
      console.error('Failed to print:', response.error);
    }
  } catch (error) {
    console.error('Error during print:', error);
  }
}

export default printThermalTicket