"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cmd_1 = __importDefault(require("node-cmd"));
const crypto_1 = __importDefault(require("crypto"));
const child_process_1 = require("child_process");
const simple_git_1 = __importStar(require("simple-git"));
const logger_1 = require("./logger");
exports.gitPull = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const hmac = crypto_1.default.createHmac("sha1", (_a = process.env.SECRET) !== null && _a !== void 0 ? _a : '');
    const sig = "sha1=" + hmac.update(JSON.stringify(req.body)).digest("hex");
    const commits = req.body.head_commit.message.split("\n").length == 1 ? req.body.head_commit.message : req.body.head_commit.message.split("\n").map((el, i) => i !== 0 ? "                       " + el : el).join("\n");
    console.log(`[GIT] web hook`);
    if (req.headers['x-github-event'] == "push" && sig == req.headers['x-hub-signature']) {
        yield git.reset(simple_git_1.ResetMode.HARD);
        git.pull().then((value => {
            console.log(value);
            logger_1.Log.create({ message: `[GIT] pull values: ${JSON.stringify(value)}` });
            let isChange = false;
            Object.keys(value.summary).forEach((el) => {
                if (value.summary[el] > 0) {
                    isChange = true;
                }
            });
            if (value.created.length > 0 ||
                value.deleted.length > 0 ||
                value.files.length > 0 ||
                Object.keys(value.deletions).length > 0 ||
                Object.keys(value.insertions).length > 0) {
                isChange = true;
            }
            if (isChange) {
                child_process_1.exec('npm i', (err, stdout, stderr) => {
                    logger_1.Log.create({ message: `[GIT] Updated with origin/master commits:${commits}` });
                    console.log("[NPM] update start");
                    if (err) {
                        console.log(err);
                        logger_1.Log.create({ message: `[GIT] Pull error: ${err}` });
                    }
                    else {
                        console.log(stdout);
                        console.log(stderr);
                    }
                    node_cmd_1.default.run('pm2 restart app');
                    console.log("[NPM] update finished");
                });
            }
        })).catch(err => {
            logger_1.Log.create({ message: `[GIT] Pull error: ${err}` });
        });
    }
    res.sendStatus(200);
});
const git = simple_git_1.default();
