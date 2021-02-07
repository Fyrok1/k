"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cron_1 = require("cron");
new cron_1.CronJob('0 */2 * * *', function () {
    // if (fs.existsSync('./tmp')) {
    //   fs.readdirSync('./tmp').forEach(filename=>{
    //     let stats = fs.statSync('./tmp/'+filename)
    //     if ((new Date().getTime())-(new Date(stats.mtime).getTime()) > (1000*60*60*24)) {
    //       rimraf('./tmp/'+filename+'/',err=>{
    //         console.log(err);
    //       })
    //     }
    //   })
    // }
}, () => { }, true);
