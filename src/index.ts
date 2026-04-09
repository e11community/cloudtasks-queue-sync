import * as core from '@actions/core'
import {sync} from './sync'

async function run(): Promise<void> {
  const queuePath = core.getInput('queue_path', {required: true})
  const mock = core.getBooleanInput('mock')
  const dryRun = core.getBooleanInput('dry_run')
  const projectId = core.getInput('project_id', {required: !mock}) || undefined

  const result = await sync({projectId, queuePath, dryRun, mock})

  core.setOutput('remaining', JSON.stringify(result.remaining))
  core.setOutput('deleted', JSON.stringify(result.deleted))
}

run().catch(error => {
  core.setFailed(error instanceof Error ? error.message : String(error))
})
