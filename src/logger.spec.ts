import {Logger} from './logger'

describe('Logger', () => {
  let warnSpy: jest.SpyInstance
  let infoSpy: jest.SpyInstance
  let errorSpy: jest.SpyInstance
  const originalNoColor = process.env.NO_COLOR

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {})
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
    infoSpy.mockRestore()
    errorSpy.mockRestore()
    if (originalNoColor === undefined) {
      delete process.env.NO_COLOR
    } else {
      process.env.NO_COLOR = originalNoColor
    }
  })

  describe('with NO_COLOR unset', () => {
    beforeEach(() => {
      delete process.env.NO_COLOR
    })

    it('warn emits ANSI yellow with [WARN] prefix', () => {
      new Logger().warn('hello')
      expect(warnSpy).toHaveBeenCalledWith('\x1b[33m[WARN] hello\x1b[0m')
    })

    it('error emits ANSI red with [ERROR] prefix', () => {
      new Logger().error('boom')
      expect(errorSpy).toHaveBeenCalledWith('\x1b[31m[ERROR] boom\x1b[0m')
    })

    it('info emits no ANSI with [INFO] prefix', () => {
      new Logger().info('fyi')
      expect(infoSpy).toHaveBeenCalledWith('[INFO] fyi')
    })
  })

  describe('with NO_COLOR set', () => {
    beforeEach(() => {
      process.env.NO_COLOR = '1'
    })

    it('warn emits plain [WARN] prefix', () => {
      new Logger().warn('hello')
      expect(warnSpy).toHaveBeenCalledWith('[WARN] hello')
    })

    it('error emits plain [ERROR] prefix', () => {
      new Logger().error('boom')
      expect(errorSpy).toHaveBeenCalledWith('[ERROR] boom')
    })

    it('info emits plain [INFO] prefix', () => {
      new Logger().info('fyi')
      expect(infoSpy).toHaveBeenCalledWith('[INFO] fyi')
    })
  })

  it('captures NO_COLOR at construction, not at call time', () => {
    delete process.env.NO_COLOR
    const logger = new Logger()
    process.env.NO_COLOR = '1'
    logger.warn('hello')
    expect(warnSpy).toHaveBeenCalledWith('\x1b[33m[WARN] hello\x1b[0m')
  })
})
