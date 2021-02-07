"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cryptr_1 = __importDefault(require("cryptr"));
exports.cryptr = new cryptr_1.default(process.env.SECRET);
