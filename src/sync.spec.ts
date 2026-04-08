import {resolve} from 'path'
import {sync} from './sync'

const QUEUE_YAML = resolve(__dirname, '__fixtures__/queue.yaml')

const MOCK_QUEUES = [
  'alpha',
  'beta',
  'gamma',
  'delta',
  'epsilon',
  'zeta',
  'eta',
  'theta',
  'iota',
  'kappa',
  'lambda',
  'mu',
  'nu',
  'xi',
  'omicron',
  'pi',
  'rho',
  'sigma',
  'tau',
  'upsilon',
  'phi',
  'chi',
  'psi',
  'omega',
]

describe('sync', () => {
  it('returns remaining and deleted queues in mock mode', async () => {
    const result = await sync({
      queuePath: QUEUE_YAML,
      projectId: 'mock-project',
      mock: true,
    })

    expect(result.remaining).toEqual(['alpha', 'beta', 'gamma', 'delta'])
    expect(result.deleted).toEqual(MOCK_QUEUES.filter(q => !['alpha', 'beta', 'gamma', 'delta'].includes(q)))
  })

  it('does not include queues not discovered in GCP in remaining', async () => {
    const result = await sync({
      queuePath: QUEUE_YAML,
      projectId: 'mock-project',
      mock: true,
    })

    // remaining only includes queues that exist in both the yaml AND discovered queues
    for (const q of result.remaining) {
      expect(MOCK_QUEUES).toContain(q)
    }
  })

  it('remaining + deleted covers all discovered queues', async () => {
    const result = await sync({
      queuePath: QUEUE_YAML,
      projectId: 'mock-project',
      mock: true,
    })

    const all = [...result.remaining, ...result.deleted].sort()
    expect(all).toEqual([...MOCK_QUEUES].sort())
  })

  it('returns all queues as deleted when queue.yaml has no matching queues', async () => {
    const emptyYaml = resolve(__dirname, '__fixtures__/empty-queue.yaml')
    const fs = await import('fs')
    fs.writeFileSync(emptyYaml, 'queue:\n  - name: nonexistent\n')

    try {
      const result = await sync({
        queuePath: emptyYaml,
        projectId: 'mock-project',
        mock: true,
      })

      expect(result.remaining).toEqual([])
      expect(result.deleted).toEqual(MOCK_QUEUES)
    } finally {
      fs.unlinkSync(emptyYaml)
    }
  })

  it('never deletes the default queue even when not in queue.yaml', async () => {
    const result = await sync({
      queuePath: QUEUE_YAML,
      projectId: 'mock-project',
      mock: true,
      mockQueues: ['default', 'alpha', 'beta', 'zeta'],
    })

    expect(result.remaining).toContain('default')
    expect(result.remaining).toContain('alpha')
    expect(result.remaining).toContain('beta')
    expect(result.deleted).toEqual(['zeta'])
    expect(result.deleted).not.toContain('default')
  })

  it('does not inject default queue when it is not discovered', async () => {
    const result = await sync({
      queuePath: QUEUE_YAML,
      projectId: 'mock-project',
      mock: true,
      mockQueues: ['alpha', 'beta', 'zeta'],
    })

    expect(result.remaining).toEqual(['alpha', 'beta'])
    expect(result.remaining).not.toContain('default')
    expect(result.deleted).toEqual(['zeta'])
  })

  it('verbose output is printed when mock is true', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()

    await sync({
      queuePath: QUEUE_YAML,
      projectId: 'mock-project',
      mock: true,
    })

    expect(spy).toHaveBeenCalled()
    const output = spy.mock.calls[0][0] as string
    expect(output).toContain('remaining:')
    expect(output).toContain('deleted:')

    spy.mockRestore()
  })

  it('verbose output is printed when dryRun is true', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()

    await sync({
      queuePath: QUEUE_YAML,
      projectId: 'mock-project',
      mock: true,
      dryRun: true,
    })

    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('verbose can be explicitly disabled', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation()

    await sync({
      queuePath: QUEUE_YAML,
      projectId: 'mock-project',
      mock: true,
      verbose: false,
    })

    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
