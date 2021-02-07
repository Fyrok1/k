import fs from 'fs'
import { Socket } from './socket'
import 'express-async-errors'
import { httpServer } from './app'
import mkdirp from 'mkdirp'
import path from 'path'

// MIDDLEWARES
import './middlewares'
import i18next from 'i18next'
import { supportedLanguges } from './language'

createRequiredDirs([
  "./locales",
  "./uploads",
])

httpServer.listen(process.env.PORT,()=>{
  console.log("Server on localhost:"+process.env.PORT);
})

if (process.env.NODE_ENV != "production") {
  let cooldown = 0;
  setInterval(()=>{
    if (cooldown > 0) {
      cooldown--;
    }
  },1000)

  fs.watch(path.join(path.resolve(),'/public'),{recursive:true},(event,filename)=>{
    if (cooldown == 0) {
      cooldown = 2
      if (filename.endsWith('.css')) {
        console.log(`CSS UPDATE ${filename}`);
        Socket.emit('refresh-css')  
      }else{
        console.log(`PUBLIC UPDATE ${filename}`);
        Socket.emit('refresh-page')  
      }
    }
  })
  fs.watch(path.join(path.resolve(),'/src/views'),{recursive:true},(event,filename)=>{
    if (filename.endsWith('.ejs') && cooldown == 0) {
      cooldown = 2
      console.log(`EJS UPDATE ${filename}`);
      Socket.emit('refresh-page')  
    }
  })
 
  fs.watch(path.join(path.resolve(),'/dist'),{recursive:true},(event,filename)=>{
    if (cooldown == 0) {
      cooldown = 2
      console.log(`DIST UPDATE ${filename}`);
      Socket.emit('refresh-page')  
    }
  })

  if (process.env.MULTI_LANG == "1") {
    fs.watch(path.join(path.resolve(),'/locales'),{recursive:true},(event,filename)=>{
      i18next.reloadResources(supportedLanguges)
      if (cooldown == 0) {
        cooldown = 2
        console.log(`LOCALES UPDATE ${filename}`);
        Socket.emit('refresh-page')  
      }
    })
  }
}

async function createRequiredDirs(arr){
  arr.forEach(async(filePath) => {
    await mkdirp.sync(filePath)
  });
}