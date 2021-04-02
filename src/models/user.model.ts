import { Table, Column, Model, DataType, BeforeCreate } from 'sequelize-typescript';
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
	paranoid: true,
})
export default class User extends Model {
	@Column({
		type: DataType.STRING,
		allowNull: false
	})
	name: string

	@Column({
		type: DataType.STRING,
		allowNull: false
	})
	email: string

	@Column({
		type: DataType.STRING,
		allowNull: false
	})
	password: string

	@Column({
		type: DataType.TINYINT,
		allowNull: false,
		defaultValue: 1
	})
	status: string

	@BeforeCreate
	static hashPasswordBeforeCreate(user: User) {
		if (user.password) {
			user.password = bcrypt.hashSync(user.password, 10);
		}
	}

	async validPassword(password: string): Promise<boolean> {
		try {
			return await bcrypt.compare(password, this.password);
		} catch (error) {
			return false
		}
	}
}