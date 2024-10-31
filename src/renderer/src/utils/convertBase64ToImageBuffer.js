import escpos from 'escpos';
import { USB } from 'escpos-usb';
import Jimp from 'jimp'; // We will use Jimp for image processing

escpos.USB = USB;

// Helper function to convert base64 image to ESC/POS format and print
const convertBase64ToImageBuffer = async (base64Image) => {
  try {
    // Decode the base64 image
    const buffer = Buffer.from(base64Image.split(',')[1], 'base64');

    // Use Jimp to process the image
    const image = await Jimp.read(buffer);

    // Convert the image to a monochrome bitmap suitable for ESC/POS
    image.resize(512, Jimp.AUTO); // Resize image to 512 pixels wide
    image.greyscale(); // Convert to grayscale
    image.dither565(); // Apply dithering for better printing results

    // Convert image to bitmap buffer for ESC/POS
    const bitmapBuffer = image.bitmap.data;

    // Initialize the USB device and printer
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    // Open the device, print the image, and close the device
    await new Promise((resolve, reject) => {
      device.open((error) => {
        if (error) return reject(error);

        printer
          .raster(new escpos.Image(bitmapBuffer), 'dwdh') // Adjust the print density as needed
          .cut()
          .close(() => resolve(printer.buffer));
      });
    });

    return printer.buffer;
  } catch (error) {
    console.error('Error converting base64 image to ESC/POS format:', error);
    throw error;
  }
};

export default convertBase64ToImageBuffer