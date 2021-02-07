"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const io = __importStar(require("socket.io"));
class Socket {
    constructor(httpApp) {
        this.io = new io.Server(httpApp);
        this.io.on('connection', () => {
            //console.log('new Connection');
        });
        setTimeout(() => {
            this.emit('refresh-page');
        }, 250);
    }
    emit(event, data = {}) {
        this.io.emit(event, data);
    }
}
exports.default = Socket;
