export class Logger {
  private readonly useColor: boolean

  constructor() {
    this.useColor = !process.env.NO_COLOR
  }

  warn(msg: string): void {
    const prepend = '[WARN] '
    if (this.useColor) {
      console.warn(`\x1b[33m${prepend}${msg}\x1b[0m`)
    } else {
      console.warn(`${prepend}${msg}`)
    }
  }

  info(msg: string): void {
    console.info(`[INFO] ${msg}`)
  }

  error(msg: string): void {
    const prepend = '[ERROR] '
    if (this.useColor) {
      console.error(`\x1b[31m${prepend}${msg}\x1b[0m`)
    } else {
      console.error(`${prepend}${msg}`)
    }
  }
}
