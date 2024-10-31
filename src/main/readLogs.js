import fs from 'fs';
import path from 'path';
// import logger from '../renderer/src/utils/logger.cjs'; // Assuming you're using the logger you set up earlier

const logsDirectory = path.join(__dirname, '../logs'); // Adjust the path to your logs directory

const readLogs = () => {
  try {
    // logger.info(`Attempting to read logs from directory: ${logsDirectory}`);
    const logFiles = fs.readdirSync(logsDirectory);
    // logger.info(`Log files found: ${logFiles.join(', ')}`);

    const logFilesFiltered = logFiles.filter(file => file.endsWith('.log'));
    // logger.info(`Filtered log files: ${logFilesFiltered.join(', ')}`);

    const sortedLogFiles = logFilesFiltered.sort((a, b) => {
      const aPath = path.join(logsDirectory, a);
      const bPath = path.join(logsDirectory, b);
      return fs.statSync(bPath).mtime - fs.statSync(aPath).mtime;
    });

    const latestLogFile = sortedLogFiles[0];
    // logger.info(`Latest log file: ${latestLogFile}`);

    const logFilePath = path.join(logsDirectory, latestLogFile);
    // logger.info(`Reading log file at path: ${logFilePath}`);

    const logs = fs.readFileSync(logFilePath, 'utf8');
    // logger.info('Successfully read log file');
    return logs;
  } catch (error) {
    // logger.error(`Failed to read log file: ${error.message}`);
    console.error('Failed to read log file:', error);
    return 'Failed to load logs.';
  }
};

export default readLogs;
