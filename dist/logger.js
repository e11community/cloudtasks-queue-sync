"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    useColor;
    constructor() {
        this.useColor = !process.env.NO_COLOR;
    }
    warn(msg) {
        const prepend = '[WARN] ';
        if (this.useColor) {
            console.warn(`\x1b[33m${prepend}${msg}\x1b[0m`);
        }
        else {
            console.warn(`${prepend}${msg}`);
        }
    }
    info(msg) {
        console.info(`[INFO] ${msg}`);
    }
    error(msg) {
        const prepend = '[ERROR] ';
        if (this.useColor) {
            console.error(`\x1b[31m${prepend}${msg}\x1b[0m`);
        }
        else {
            console.error(`${prepend}${msg}`);
        }
    }
}
exports.Logger = Logger;
