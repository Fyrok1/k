import redis from "redis";
export let redisClient = null;

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
    console.error("Redis Down",error);
  });
  
  redisClient.on("connect", function() {
    console.log("Redis Up");
  });
}