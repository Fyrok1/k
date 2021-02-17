# K

## v0.0.1 is here 🎉

## Features 🎢

* [Typescript](https://www.typescriptlang.org/)
* with [express](https://expressjs.com/)
* [Redis](https://redis.io/) support
* Database support with [Sequelize](https://sequelize.org/master/)
* Database migration with [Sequelize](https://sequelize.org/master/)
* MVC architecture
* Multi language support with [i18next](https://www.i18next.com/)
* [Angular](https://angular.io/) Support
* [CSRF](https://www.npmjs.com/package/csurf) protection
* [SCSS](https://sass-lang.com/) compailer
* Server Side Render with [EJS](https://ejs.co/)
* Logging support with [winston](https://www.npmjs.com/package/winston)
* Rate limitter
* Session and Authorization
* Fully customizable
* Customizable Error Pages

## Development Features 🎠

* Simple build and start
* Auto refresh on changes (.ts, .ejs and public folder)
* On (S)CSS change page updated without page refresh
* Build and Watch angular app and refresh pages

## Installation 🎟

Clone with [create-clone](https://www.npmjs.com/package/create-clone)

`
npx create-clone github:Fyrok1/k#0.0.1 <local-folder-name>
`

or

select branch 0.0.1, dowload reposity and unzip

# Documantation

## Express App

you could access default express app with 

`
import app from 'src/k/app'
`

## Routing

`src/web/router.ts` contains two required variable named `DefaultRouter` and `MultilangRouter`

* DefaultRouter `express.Router()` !required

Could used for all routes and entegrate other routes

* MultilangRouter `express.Router()` !required

When multi-language support is activated, it will be used for it, otherwise it is no different from DefaultRouter.

> If you want to separate the route files, you can keep them in `src/web/routers` folder with .ts extension

## Controllers

Controllers will stored in `src/controllers` with .ts extension

**Example**


> Do not forget import definition

```ts
//Definition
export default {
  someController(req,res){
    res.send('Hello World')
  }
}

//Usage
DefaultRouter
  .get('/',<file-name>.someController)
```

```ts
//Definition
export const SiteController = {
  someController(req,res){
    res.send('Hello World')
  }
}

//Usage
DefaultRouter
  .get('/',SiteController.someController)
```

```ts
//Definition
export const someController = (req,res) => {
  res.send('Hello World')
}

//Usage
DefaultRouter
  .get('/',someController)
```

## Views

Views will stored in `src/views` with .ejs extension
We have four folder
1. Layouts
2. Pages
3. Partials
3. Errors

### Layouts

> Default Layout is null

**Example**

```html
<!DOCTYPE html>
<html>
<head>
  <%- meta %>
  <title><%- title %></title>
  <%- head %>
  <%- style %>
</head>
<body>
  <%- body %>
</body>
<%- script %>
</html>
```

to be continued...

## Models

Models will stored in `src/models` with .model.ts extension

For more details [sequelize-typescript](https://www.npmjs.com/package/sequelize-typescript)

**Example**

```ts
import { Table, Column, Model, DataType } from 'sequelize-typescript';
import bcrypt from "bcrypt";

// Example User
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

  async validPassword(password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      return false
    }
  }
}

User.beforeCreate((user:User, options) => {
  return bcrypt.hash(user.password, 10)
    .then(hash => {
      user.password = hash;
    })
    .catch(err => { 
      throw new Error(); 
    });
})
```

> **WARNING** do not touch `src/k/models` *if you do not know what to do* 

# Known Issues

1. Socket io usage on development with SOCKET=1

# TO DO

* Custom Functions will gather under K
* Logger model relocated to models folder

## For Collaboration, Questions and Ideas Mail to Me
[tahsin cesur](mailto:tahsincesur1@gmail.com)