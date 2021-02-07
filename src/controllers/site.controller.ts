import express from 'express'

export const SiteController = new class{
  getLayout(){
    return async function(req:express.Request,res:express.Response,next:express.NextFunction){
      next()
    }
  }
  async getIndex(req:express.Request,res:express.Response){
    res.render('pages/site/index')
  }
}