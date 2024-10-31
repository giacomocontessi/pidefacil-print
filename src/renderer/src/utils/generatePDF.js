import { PDFDocument, StandardFonts } from 'pdf-lib';

export const generatePDF = async (ticketInfo, printerOptions) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([printerOptions.paperSize === '80mm' ? 400 : 300, 800]); // Adjust the height as needed
  
    const { width, height } = page.getSize();
    const fontSize = 12;
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
    let yPosition = height - fontSize * 2;
  
    const wrapText = (text, maxWidth) => {
      if (typeof text !== 'string') {
        console.error('Expected string, received:', text);
        return ['']; // Return an empty string to avoid further issues
      }
  
      const lines = [];
      let currentLine = '';
  
      text.split(' ').forEach((word) => {
        const lineWidth = font.widthOfTextAtSize(currentLine + ' ' + word, fontSize);
        if (lineWidth < maxWidth) {
          currentLine += word + ' ';
        } else {
          lines.push(currentLine.trim());
          currentLine = word + ' ';
        }
      });
      lines.push(currentLine.trim());
      return lines;
    };
  
    const addTextToPage = (text) => {
      const lines = wrapText(text, width - 40);
      lines.forEach((line) => {
        page.drawText(line, { x: 20, y: yPosition, size: fontSize, font });
        yPosition -= fontSize + 4;
      });
    };
  
    // Add order ID
    addTextToPage(`Order ID: ${ticketInfo.readableId}`);
  
    // Add other sections similar to the original ticket content
    if (printerOptions.productos) {
      ticketInfo.cart.forEach((item) => {
        addTextToPage(item.product.name.toUpperCase());
  
        // Handle selected options
        if (item.product.selectedOptions) {
          Object.values(item.product.selectedOptions).forEach((option) => {
            if (typeof option === 'string') {
              addTextToPage(`- ${option}`);
            } else if (Array.isArray(option)) {
              option.forEach((opt) => {
                if (opt.title) {
                  addTextToPage(`- ${opt.title}`);
                } else {
                  console.warn('Array option without title detected:', opt);
                }
              });
            } else if (typeof option === 'object' && option.title) {
              addTextToPage(`- ${option.title}`);
            } else {
              console.warn('Non-string option detected:', option);
            }
          });
        }
      });
    }
  
    // Add client details if needed
    if (printerOptions.datosCliente) {
      addTextToPage(`Client: ${ticketInfo.client.clientName}`);
      addTextToPage(`Phone: ${ticketInfo.client.phoneNumber}`);
      if (printerOptions.includeAddress && typeof ticketInfo.client.address.address === 'string') {
        addTextToPage(`Address: ${ticketInfo.client.address.address}`);
      }
    }
  
    // Add footer text
    if (printerOptions.footerText && typeof printerOptions.footerText === 'string') {
      addTextToPage(printerOptions.footerText);
    }
  
    // Add QR code placeholder
    if (printerOptions.codigoQR) {
      addTextToPage('QR CODE');
    }
  
    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  };
  