import winston, { format } from "winston"
import Transport from "winston-transport"
import { sequelize } from "./sequelize";
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  modelName: 'Log',
  tableName: 'logs',
  updatedAt: false
})
class Log extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: Number;

  @Column({
    type: DataType.STRING
  })
  level: String;

  @Column({
    type: DataType.TEXT({ length: 'medium' }),
    set: function (value) {
      try {
        const val = JSON.stringify(value)
        this.setDataValue('message', val);
      } catch (error) {
        this.setDataValue('message', value);
      }
      this.setDataValue('message', JSON.stringify(value));
    },
    get: function () {
      return JSON.parse(this.getDataValue('meta'));
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any
}

if (process.env.DB == "1") {
  sequelize.addModels([Log])
}

class SequelizeTransport extends Transport {
  constructor(opts) {
    super(opts);
    if (process.env.DB != "1") {
      console.error(new Error('Sequelize Transport: DB != 1'))
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
      console.error(new Error('Sequelize Transport: DB != 1'))
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