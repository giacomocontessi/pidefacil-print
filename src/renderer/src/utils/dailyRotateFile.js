const DailyRotateFile = require('winston-daily-rotate-file');

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(__dirname, 'logs', 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'  // Keep logs for the last 14 days
    }),
    new transports.Console()
  ]
});
