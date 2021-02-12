import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  modelName: 'Logs',
  tableName: 'logs',
  updatedAt: false
})
export default class Logs extends Model {
  @Column({
    type: DataType.TEXT({ length: "medium" }),
    allowNull: false
  })
  message: string

  @Column({
    type: DataType.STRING,
    defaultValue: "SYSTEM"
  })
  ip: string
}