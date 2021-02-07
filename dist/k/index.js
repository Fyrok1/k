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
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const socket_1 = __importDefault(require("./socket"));
require("express-async-errors");
const app_1 = __importDefault(require("./app"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const path_1 = __importDefault(require("path"));
// MIDDLEWARES
require("./middlewares");
const i18next_1 = __importDefault(require("i18next"));
const language_1 = require("./language");
createRequiredDirs([
    "./locales",
    "./uploads",
]);
const httpServer = http_1.default.createServer(app_1.default);
httpServer.listen(process.env.PORT, () => {
    console.log("Server on localhost:" + process.env.PORT);
});
if (process.env.NODE_ENV != "production") {
    let cooldown = 0;
    setInterval(() => {
        if (cooldown > 0) {
            cooldown--;
        }
    }, 1000);
    const socket = new socket_1.default(httpServer);
    fs_1.default.watch(path_1.default.join(path_1.default.resolve(), '/public'), { recursive: true }, (event, filename) => {
        if (cooldown == 0) {
            cooldown = 2;
            if (filename.endsWith('.css')) {
                console.log(`CSS UPDATE ${filename}`);
                socket.emit('refresh-css');
            }
            else {
                console.log(`PUBLIC UPDATE ${filename}`);
                socket.emit('refresh-page');
            }
        }
    });
    fs_1.default.watch(path_1.default.join(path_1.default.resolve(), '/src/views'), { recursive: true }, (event, filename) => {
        if (filename.endsWith('.ejs') && cooldown == 0) {
            cooldown = 2;
            console.log(`EJS UPDATE ${filename}`);
            socket.emit('refresh-page');
        }
    });
    fs_1.default.watch(path_1.default.join(path_1.default.resolve(), '/locales'), { recursive: true }, (event, filename) => {
        i18next_1.default.reloadResources(language_1.supportedLanguges);
        if (cooldown == 0) {
            cooldown = 2;
            console.log(`LOCALES UPDATE ${filename}`);
            socket.emit('refresh-page');
        }
    });
    fs_1.default.watch(path_1.default.join(path_1.default.resolve(), '/dist'), { recursive: true }, (event, filename) => {
        if (cooldown == 0) {
            cooldown = 2;
            console.log(`DIST UPDATE ${filename}`);
            socket.emit('refresh-page');
        }
    });
}
function createRequiredDirs(arr) {
    return __awaiter(this, void 0, void 0, function* () {
        arr.forEach((filePath) => __awaiter(this, void 0, void 0, function* () {
            yield mkdirp_1.default.sync(filePath);
        }));
    });
}
