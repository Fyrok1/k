import {Sequelize} from 'sequelize-typescript';
import path from 'path'
import express from 'express'

export let sequelizeStatus:{
  status:boolean,
  err?:Error|string
} = {
  status:false,
  err:"Sequelize Connecting..."
}

export const checkConnection = (req:express.Request,res:express.Response,next:express.NextFunction)=>{
  if (sequelizeStatus.status) {
    next()
  }else{
    res.render('pages/k/error',{
      env:process.env,
      layout:null,
      error:sequelizeStatus.err
    })
  }
}

export const sequelize = new Sequelize({
  username:process.env.DB_USER,
  password:process.env.DB_PASS,
  database:process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: 'mysql',
  models: [
    path.join(__dirname,'../models')
  ],
  logging:false
});
check();

async function check(){
  try {
    await sequelize.authenticate()
    sequelize.sync({alter:true,force:false})
    sequelizeStatus = {
      status:true,
      err:""
    }
  } catch (error) {
    sequelizeStatus = {
      status:false,
      err:error
    }
    console.error(error)
    if (process.env.NODE_ENV == "production") {
      setTimeout(() => {
        check();
      }, 2000);
    }
  }
}