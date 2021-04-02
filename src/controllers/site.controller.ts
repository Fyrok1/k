import express from 'express'
import { Login, Logout } from '../k/authGuard'

export const SiteController = new class{
  getIndex(req:express.Request,res:express.Response){
    res.render('pages/site/index')
  }

  getSecret(req,res){
    res.render('pages/site/secret')
  }

  getNonSecret(req,res){
    res.render('pages/site/nonsecret')
  }
  
  getLogin(req,res){
    Login(req).then(()=>{
      res.redirect('/secret')
    })
  }
  
  getLogout(req,res){
    Logout(req).then(()=>{
      res.redirect('/nonsecret')
    })
  }
}