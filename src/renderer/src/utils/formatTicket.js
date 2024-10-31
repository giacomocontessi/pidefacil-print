import calculateOrderTotal from "./calculateOrderTotal";
import getFormattedAddress from "./getFormattedAddress";

export const formatTicket = async (order, printerOptions) => {
  const lineWidth = printerOptions.paperSize === '80mm' ? 48 : 32; // Adjust width based on paper size
  let ticketContent = '';

  // Helper function to add line breaks for wrapping text
  const wrapText = (text) => {
    const regex = new RegExp(`(.{1,${lineWidth}})`, 'g');
    return text.match(regex).join('\n');
  };

  // Retrieve the logo and footer text from the store asynchronously
  const logo = await window.electron.store.get('logo');
  const footerText = await window.electron.store.get('footerText');

  // If the option is enabled and logo exists, print the logo separately
  // if (printerOptions.logo && logo) {
  //   try {
  //     // Print the logo separately (as an image)
  //     await window.electron.printToPrinter(printerOptions.printerName, '', logo); // Send the logo to be printed
  //   } catch (error) {
  //     console.error('Error printing logo:', error);
  //     // Fallback to adding a text placeholder for the logo if image printing fails
  //     ticketContent += '--- LOGO ---\n'.padStart(lineWidth / 2 + 8, ' ');
  //   }
  // }

  // Order ID
  ticketContent += `***#${order.readableId}***\n`;

  // Separator after Header
  ticketContent += '\n' + ''.padEnd(lineWidth, '-') + '\n'; // Line separator with padding

  // Products Section
  if (printerOptions.productos) {
    order.cart.forEach((cartItem) => {
      const { product, quantity } = cartItem;
      const productName = quantity > 1 ? `**${wrapText(product.name.toUpperCase())} (x${quantity})**` : `**${wrapText(product.name.toUpperCase())}**`;
      ticketContent += `\n${productName}\n`;

      // Render product options with simple indentation
      if (product.selectedOptions) {
        Object.entries(product.selectedOptions).forEach(([optionGroup, optionValue]) => {
          if (typeof optionValue === 'string') {
            ticketContent += ` - ${wrapText(optionValue)}\n`;
          } else if (Array.isArray(optionValue)) {
            optionValue.forEach((option) => {
              ticketContent += ` - ${wrapText(option.title)}${option.quantity > 1 ? ` x${option.quantity}` : ''}\n`;
            });
          } else if (typeof optionValue === 'object') {
            ticketContent += ` - ${wrapText(optionValue.title)}\n`;
          }
        });
      }
    });

    // Separator after Products Section
    ticketContent += '\n' + ''.padEnd(lineWidth, '-') + '\n'; // Line separator with padding
  }

  // Client Details Section
  if (printerOptions.datosCliente) {
    const { clientName, phoneNumber, address, email, includeAddress  } = order.client;

    ticketContent += `\n**Datos del Cliente**\n`;
    ticketContent += `${wrapText('Nombre: ' + clientName)}\n`;
    ticketContent += `${wrapText('Telefono: ' +phoneNumber)}\n`;

    if (email) {
      ticketContent += `${wrapText('Email: ' + email)}\n`;
    }

    if (includeAddress && address) {
      ticketContent += `${wrapText(`Dirección: ${getFormattedAddress(address)}`)}\n`.padEnd(lineWidth, ' ');
    }

    // Separator after Client Data Section
    ticketContent += '\n' + ''.padEnd(lineWidth, '-') + '\n'; // Line separator with padding
  }

  // Subtotal and Total
  if (printerOptions.subtotalTotal) {
    const formattedSubtotal = formatCurrency(calculateOrderTotal(order.cart));
    const formattedTotal = formatCurrency(order.total || 0);

    ticketContent += `\nProductos: `.padEnd(lineWidth - 10, ' ') + `${formattedSubtotal}\n`;
    ticketContent += `Total: `.padEnd(lineWidth - 10, ' ') + `${formattedTotal}\n`;
  }

  // Footer with QR Code Placeholder (no separator before QR code)
  if (printerOptions.codigoQR) {
    ticketContent += '\n--- CÓDIGO QR AQUÍ ---\n'.padStart(lineWidth / 2 + 10, ' ');
  }

  // Add a separator before the footer
  if (footerText) {
    // ticketContent += '-'.repeat(lineWidth) + '\n'; // Separator before the footer text
    ticketContent += `\n${wrapText(footerText)}\n`;
  }

  ticketContent += '\n'.padEnd(lineWidth, '-'); // Final Footer line

  // Print the ticket content (text only)
  // await window.electron.printToPrinter(printerOptions.printerName, ticketContent);

  return ticketContent; // Ensure the function returns the content as a string
};

// Utility function to format currency values
const formatCurrency = (value) => {
  return `$${value.toFixed(2)}`; // Adjust to your desired currency formatting
};
