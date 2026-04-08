import * as core from '@actions/core'
import {sync} from './sync'

async function run(): Promise<void> {
  const projectId = core.getInput('project_id', {required: true})
  const queuePath = core.getInput('queue_path', {required: true})
  const dryRun = core.getBooleanInput('dry_run')
  const mock = core.getBooleanInput('mock')

  const result = await sync({projectId, queuePath, dryRun, mock})

  core.setOutput('remaining', JSON.stringify(result.remaining))
  core.setOutput('deleted', JSON.stringify(result.deleted))
}

run().catch(error => {
  core.setFailed(error instanceof Error ? error.message : String(error))
})
