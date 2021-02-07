import express from "express";
import redis from "redis";

export let redisStatus:{
  status:boolean,
  err?:Error|string
} = {
  status:false,
  err:"Redis Connecting..."
};

export let redisClient:redis.RedisClient = null;

if (process.env.REDIS == "1") {
  redisClient = redis.createClient(process.env.REDISPORT ? parseInt(process.env.REDISPORT) : 6379,process.env.REDISHOST,{password:process.env.REDISPASSWORD});
    
  redisClient.select(process.env.NODE_ENV == "production" ? 0 : 1,(err:Error)=>{
    if (err) {
      console.log(err);
    }else {
      //redisClient.set('test',(new Date().getTime().toString()))
    }
  })
  
  redisClient.on("error", function(error) {
    redisStatus = {
      status:false,
      err:error
    }
    console.error("Redis Down",error);
  });
  
  redisClient.on("connect", function() {
    redisStatus = {
      status:true,
      err:""
    };
    console.log("Redis Up");
  });
}else {
  redisStatus.err = "Redis disabled";
}

export const checkRedisConnection = (req:express.Request,res:express.Response,next:express.NextFunction)=>{
  if (process.env.REDIS == "1") {
    if (redisStatus.status) {
      next()
    }else{
      res.render('pages/k/error',{
        env:process.env,
        layout:null,
        error:redisStatus.err
      })
    }
  }else{
    next();
  }
}