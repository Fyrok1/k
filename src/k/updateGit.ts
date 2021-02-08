import cmd from "node-cmd"
import crypto from "crypto"
import { exec } from 'child_process'
import simpleGit, { ResetMode } from "simple-git";
import express from "express";
import { Log } from "./logger";

const git = simpleGit()

export const gitPull = async (req:express.Request,res:express.Response):Promise<void>=>{
  const hmac = crypto.createHmac("sha1", process.env.SECRET ?? '');
  const sig  = "sha1=" + hmac.update(JSON.stringify(req.body)).digest("hex");
  const commits = req.body.head_commit.message.split("\n").length == 1 ? req.body.head_commit.message : req.body.head_commit.message.split("\n").map((el, i:number) => i !== 0 ? "                       " + el : el).join("\n");

  console.log(`[GIT] web hook`);
  if (sig == req.headers['x-hub-signature']) { 
    await git.reset(ResetMode.HARD);
    git.pull().then((value=>{
      Log.create({message:`[GIT] pull values: ${JSON.stringify(value)}`})
      let isChange = false;
      Object.keys(value.summary).forEach((el)=>{
        if (value.summary[el] > 0) {
          isChange = true;
        }
      })

      if (
        value.created.length > 0 ||
        value.deleted.length > 0 ||
        value.files.length > 0 ||
        Object.keys(value.deletions).length > 0 ||
        Object.keys(value.insertions).length > 0
      ) {
        isChange = true
      }

      if (isChange) {
        exec('npm i',(err,stdout,stderr)=>{
          Log.create({message:`[GIT] Updated with origin/master commits:${commits}`})
          if (err) {
            Log.create({message:`[GIT] Pull error: ${err}`})
          }else{
            Log.create({message:stdout})
            if (stderr) {
              Log.create({message:stderr})
            }
          }
          Log.create({message:"[NPM] update finished"})
          cmd.run('pm2 restart app');
        })
      }
    })).catch(err=>{
      Log.create({message:`[GIT] Pull error: ${err}`})
    })
  }
  res.sendStatus(200);
}
