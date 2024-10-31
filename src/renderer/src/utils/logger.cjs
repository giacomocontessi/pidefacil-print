const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const logDir = path.join(__dirname, '../../../logs'); // Adjust the path as necessary

const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: `${logDir}/%DATE%-app.log`,
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d', // Keep logs for 14 days
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [
    new transports.Console(), // Logs to console
    dailyRotateFileTransport, // Logs to daily files
  ],
});

module.exports = logger;
