import { ENV } from './env';

export class LogLevels {
  public static readonly NONE = 'NONE';
  public static readonly INFO = 'INFO';
}

export class Logger {
  public static log(...data: any[]) {
    if (ENV.LOG_LEVEL.toUpperCase() == LogLevels.INFO) console.log(data);
  }

  public static error(...data: any[]) {
    if (ENV.LOG_LEVEL.toUpperCase() == LogLevels.INFO) console.error(data);
  }

  public static warn(...data: any[]) {
    if (ENV.LOG_LEVEL.toUpperCase() == LogLevels.INFO) console.warn(data);
  }
}
