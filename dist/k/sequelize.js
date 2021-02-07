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
const sequelize_typescript_1 = require("sequelize-typescript");
const path_1 = __importDefault(require("path"));
exports.sequelizeStatus = {
    status: false,
    err: "Sequelize Connecting..."
};
exports.checkConnection = (req, res, next) => {
    if (exports.sequelizeStatus.status) {
        next();
    }
    else {
        res.render('pages/k/error', {
            env: process.env,
            layout: null,
            error: exports.sequelizeStatus.err
        });
    }
};
exports.sequelize = new sequelize_typescript_1.Sequelize({
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    models: [
        path_1.default.join(__dirname, '../models')
    ],
    logging: false
});
check();
function check() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.sequelize.authenticate();
            exports.sequelize.sync({ alter: true, force: false });
            exports.sequelizeStatus = {
                status: true,
                err: ""
            };
        }
        catch (error) {
            exports.sequelizeStatus = {
                status: false,
                err: error
            };
            console.error(error);
            if (process.env.NODE_ENV == "production") {
                setTimeout(() => {
                    check();
                }, 2000);
            }
        }
    });
}
