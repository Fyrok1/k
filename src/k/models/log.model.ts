import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  modelName: 'Log',
  tableName: 'logs',
  updatedAt: false
})
export default class Log extends Model {
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