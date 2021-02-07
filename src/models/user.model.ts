import {Table, Column, Model, DataType} from 'sequelize-typescript';
import bcrypt from "bcrypt";

// User.create({
//   name:"Admin",
//   email:"tahsincesur1@gmail.com",
//   password:"123123123",
//   status:1
// }) 

@Table({
  modelName: 'User',
  tableName: 'users',
  paranoid:true,
})
export default class User extends Model{
  @Column({
    type:DataType.STRING,
    allowNull:false
  })
  name:string

  @Column({
    type:DataType.STRING,
    allowNull:false
  })
  email:string

  @Column({
    type:DataType.STRING,
    allowNull:false
  })
  password:string

  @Column({
    type:DataType.TINYINT,
    allowNull:false,
    defaultValue:1
  })
  status:string

  async validPassword(password:string):Promise<boolean> {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      return false
    }
  }
}

// User.beforeCreate((user:User, options) => {
//   return bcrypt.hash(user.password, 10)
//     .then(hash => {
//       user.password = hash;
//     })
//     .catch(err => { 
//       throw new Error(); 
//     });
// })