// Used for Sequelize Session Storage. DO NOT DELETE
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  modelName: 'Session',
  tableName: 'session',
})
export default class Session extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  sid: string;

  @Column({
    type: DataType.DATE
  })
  expires: Date;

  @Column({
    type: DataType.TEXT({ length: 'medium' })
  })
  data: string
}