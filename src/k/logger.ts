import winston, { format } from "winston"
import Transport from "winston-transport"
import { Log } from "./models/log.model";

class SequelizeTransport extends Transport {
  constructor(opts) {
    super(opts);
    if (process.env.DB != "1") {
      Logger.error(new Error('Sequelize Transport: DB != 1'))
    }
    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail, 
    //   logentries, etc.).
    //
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const message = {}
    Object.keys(JSON.parse(JSON.stringify(info)))
      .filter(key => {
        if (!['timestamp', 'level'].includes(key)) {
          return key;
        }
      })
      .forEach(key => {
        message[key] = info[key]
      })

    if (process.env.DB == "1") {
      Log.create({
        level: info.level,
        message: message,
      })
    } else {
      Logger.error(new Error('Sequelize Transport: DB != 1'))
    }

    // Perform the writing to the remote service
    callback();
  }
}

export const Logger = winston.createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.json(),
  )
})
if (process.env.NODE_ENV != 'production') {
  Logger.add(new winston.transports.Console({ format: winston.format.simple() }));
} else {
  if (process.env.DB == "1") {
    Logger.add(new SequelizeTransport({}))
  } else {
    Logger.add(new winston.transports.File({ filename: 'log/output/combined.log' }));
    Logger.add(new winston.transports.File({ filename: 'log/output/error.log', level: 'error' }));
  }
}
