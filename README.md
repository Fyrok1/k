# K

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

```
k-cli start <app-name>
```

For more information [k-cli](https://github.com/Fyrok1/k-cli)

# Documantation

## Express App

you could access default express app with 

```ts
import app from 'src/k/app'
```

## Routing

`src/web/router.ts` contains two required variable named `DefaultRouter` and `MultilangRouter`

* DefaultRouter `express.Router()` !required

Could used for all routes and entegrate other routes

* MultilangRouter `express.Router()` !required

When multi-language support is activated, it will be used for it, otherwise it is no different from DefaultRouter.

```ts
export const DefaultRouter = express.Router()
  .use(CsrfProtection) // Csrf Protection
  .use('/app', RenderAngularApp('hello-world')) // Angular App Usage. 'hello-world' is name of angular app folder
  .use('/', RateLimiterMiddleware, SiteRouter) // Simple Router Usage

// Look for Documantation for more information https://github.com/Fyrok1/k
export const MultilangRouter = express.Router()
```

> If you want to separate the route files, you can keep them in `src/web/routers` folder with .router.ts extension

**Separate Router Example**

```ts
// src/web/routers/site.router.ts
export const SiteRouter = router
  .use(SetLayoutMiddleware('./layouts/site'))
  .use(SiteController.getLayout())
  .get('/', SiteController.getIndex)
```

**Create With k-cli**
```
k-cli generate router <router-name>
```

## Controllers

Controllers will stored in `src/controllers` with .controller.ts extension

**Create With k-cli**
```
k-cli generate controller <router-name>
```

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

> Right know only **ejs** supported

Views will stored in `src/views` with .ejs extension
We have four folder
1. Layouts
2. Pages
3. Partials
4. Errors

> **Build do not include views and other ejs files do not delete src folder on production**

### Layouts

For layout support [express-ejs-layouts](https://www.npmjs.com/package/express-ejs-layouts)

**Express-ejs-layouts** options
|Name|Default|Description|
|-|-|-|
|`extractMetas`|`true`|[Details](https://www.npmjs.com/package/express-ejs-layouts#meta-blocks-extraction)|
|`extractStyles`|`true`|[Details](https://www.npmjs.com/package/express-ejs-layouts#style-blocks-extraction)|
|`extractScripts`|`true`|[Details](https://www.npmjs.com/package/express-ejs-layouts#script-blocks-extraction)|

**Layout** options

|Name|Default|Description|
|-|-|-|
|`body`|`null`|Used for print page html|
|`meta`|`null`|Used for print `extractMetas` value|
|`style`|`null`|Used for print `extractStyles` value|
|`script`|`null`|Used for print `extractScripts` value|

> Default Layout is null

You Can Set Layout for Router with 
```ts
.use(SetLayoutMiddleware('./layouts/site')) // 'site' is name of .ejs file
```

**Layout Example**

```html
<!DOCTYPE html>
<html>
<head>
  <%- meta %>
  <%- style %>
</head>
<body>
  <%- body %>
</body>
<%- script %>
</html>
```

### Errors

Stored in `src/views/errors`

Right now only available for `404` and `500` http codes

> Default pages stored in `src/k/views/pages` **Do not change this files**

### Pages

Root folder for page ejs files.

Subfolders recomended for clean code.

### Partials

In ejs u can include ejs files like
```html
<%- include('../somepartial.ejs') %>
```

if partial in partials folder u can include like

```html
<%- partial('somepartial') %>
```

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

> **WARNING** *if you do not know what to do,* do not touch `src/k/models`

## Session

You can `get` and `set` session properties like
```ts
req.session.example = 'example'
```

Session stored in `Redis`, `Database` or `Memory`
> Priority is `Redis > Database > Memory` **Memory not recomended for production

## Rate limitter

Track request with `RateLimiterMiddleware` middleware.
Add points per tracked request and store it in `redis` or `session`.
> Priority `Redis > Session` 

|Name|Default|Description|
|-|-|-|
|Duration|1|Stored For 1 second|
|Point|10|Max request count in duration|

> Changeable in .env file `RATE_LIMITTER_DURATION` and `RATE_LIMITTER_POINT`

## Logger

Using [winston-typescript](https://www.npmjs.com/package/winston) for logging

Logs will stored in **.log** file or in **DB** if **available** in .env
> Priority `DB > .log`

.log file location is **`<root>/log/output/combined.log`**
**Error logs stored in error.log file to**

**Usage Example**

```ts
import { Logger } from "src/k/logger";

Logger.info("Info log")
Logger.error("Error log")
Logger.warn("Warn log")
```

> In Development, Logs not gonna stored in DB or .log file, only print to console

# Authentication

## Login


## Logout


## Guard


## Authorization

# Angular Support

`k-cli new <projectName>` comes with an hello world app in apps folder.

> Tested on `Angular CLI: 11.2.5`

## Usage

1. Create an angular app using `ng new <app-name>` in `apps/` folder.
1. Set `outputPath:"../../dist/<app-name>"` in `angular.json`
1. Set `baseHref:""` in `angular.json`
1. You have to use angular router and set `useHash:true`
1. Add `"app-<app-name>":"cd dist/<app-name> && npm build --watch"` to `<root>/package.json` scripts
1. Add angular app to a router like below
```ts
  .use('/app', RenderAngularApp('hello-world'))
```

> You can use `ng serve` for development but you may encounter some problems mostly about url

# TO DO

* Custom Functions will gather under K
* Microservices

> **Tested on Ubuntu 20.04 and Windows 10**

## For Collaboration, Questions and Ideas Mail to Me
[tahsincesur1@gmail.com](mailto:tahsincesur1@gmail.com)