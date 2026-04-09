import {CloudTasksClient} from '@google-cloud/tasks'
import {readFileSync} from 'fs'
import {load} from 'js-yaml'
import {dump} from 'js-yaml'

export interface SyncParams {
  queuePath: string
  projectId?: string
  dryRun?: boolean
  mock?: boolean
  mockQueues?: string[]
  verbose?: boolean
}

export interface SyncResult {
  remaining: string[]
  deleted: string[]
}

interface QueueYaml {
  queue: {name: string}[]
}

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

function parseQueueYaml(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf-8')
  const parsed = load(content) as QueueYaml
  if (!parsed?.queue || !Array.isArray(parsed.queue)) {
    return []
  }
  return parsed.queue.map(q => q.name)
}

async function listAllQueues(client: CloudTasksClient, projectId: string): Promise<string[]> {
  const queueNames: string[] = []

  for await (const location of client.listLocationsAsync({name: `projects/${projectId}`})) {
    const locationName = location.name!
    for await (const queue of client.listQueuesAsync({parent: locationName})) {
      const fullName = queue.name!
      const shortName = fullName.split('/').pop()!
      queueNames.push(shortName)
    }
  }

  return queueNames
}

async function deleteQueue(client: CloudTasksClient, projectId: string, location: string, queueName: string): Promise<void> {
  const name = client.queuePath(projectId, location, queueName)
  await client.deleteQueue({name})
}

async function deleteQueues(client: CloudTasksClient, projectId: string, queueNames: string[]): Promise<void> {
  for await (const location of client.listLocationsAsync({name: `projects/${projectId}`})) {
    const locationName = location.name!
    for await (const queue of client.listQueuesAsync({parent: locationName})) {
      const fullName = queue.name!
      const shortName = fullName.split('/').pop()!
      if (queueNames.includes(shortName)) {
        const locationId = locationName.split('/').pop()!
        await deleteQueue(client, projectId, locationId, shortName)
      }
    }
  }
}

export async function sync(params: SyncParams): Promise<SyncResult> {
  const {queuePath: queueFilePath, projectId, dryRun = false, mock = false} = params
  const verbose = params.verbose ?? (dryRun || mock)

  if (!mock && !projectId) {
    throw new Error('projectId is required when mock is false')
  }

  const desiredQueues = parseQueueYaml(queueFilePath)

  let discoveredQueues: string[]
  if (mock) {
    discoveredQueues = [...(params.mockQueues ?? MOCK_QUEUES)]
  } else {
    const client = new CloudTasksClient()
    discoveredQueues = await listAllQueues(client, projectId!)
  }

  const desiredSet = new Set(desiredQueues)
  const remaining = discoveredQueues.filter(q => desiredSet.has(q) || q === 'default')
  const deleted = discoveredQueues.filter(q => !desiredSet.has(q) && q !== 'default')

  if (!dryRun && !mock && deleted.length > 0) {
    const client = new CloudTasksClient()
    await deleteQueues(client, projectId!, deleted)
  }

  if (verbose) {
    console.log(dump({remaining, deleted}, dryRun ? {} : {flowLevel: 1}))
  }

  return {remaining, deleted}
}
