"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logs_model_1 = __importDefault(require("../models/logs.model"));
exports.Log = new class {
    constructor() {
        this.create = (data = { message: "", ip: "system" }) => {
            data.message = data.message ? data.message : "Default Message";
            data.ip = data.ip ? data.ip : "System";
            if (process.env.NODE_ENV == "development") {
                console.log(data.message);
            }
            logs_model_1.default.create({
                message: data.message,
                ip: data.ip
            });
        };
    }
};
