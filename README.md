# cloudtasks-queue-sync

A GitHub Action that syncs Google Cloud Tasks queues with a `queue.yaml` file. Queues defined in the YAML file are kept; queues not in the file are deleted.

The `default` queue is never deleted, as it is required by App Engine. If it exists in the project it will always appear in `remaining`, regardless of whether it is listed in `queue.yaml`.

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `project_id` | Yes | | GCP project ID to scan for Cloud Tasks queues |
| `queue_path` | Yes | | Path to a `queue.yaml` file (same format as `gcloud app deploy`) |
| `dry_run` | No | `false` | If `true`, no writes are made to GCP |
| `mock` | No | `false` | If `true`, no GCP calls are made; uses a preset list of mock queues |

## Outputs

| Output | Description |
|--------|-------------|
| `remaining` | JSON array of queue names that exist in `queue.yaml` |
| `deleted` | JSON array of queue names that were deleted (not in `queue.yaml`) |

## Usage

```yaml
- uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}

- uses: e11community/cloudtasks-queue-sync@v1
  id: sync
  with:
    project_id: my-gcp-project
    queue_path: queue.yaml

- run: |
    echo "Remaining: ${{ steps.sync.outputs.remaining }}"
    echo "Deleted: ${{ steps.sync.outputs.deleted }}"
```

### Dry run

```yaml
- uses: e11community/cloudtasks-queue-sync@v1
  with:
    project_id: my-gcp-project
    queue_path: queue.yaml
    dry_run: true
```

## queue.yaml format

The `queue.yaml` file uses the same format as `gcloud app deploy`:

```yaml
queue:
  - name: my-queue
    rate: 1/s
  - name: another-queue
    rate: 5/s
```

## Authentication

This action uses Application Default Credentials. Use [google-github-actions/auth](https://github.com/google-github-actions/auth) in a prior step to authenticate.

## Development

```bash
npm install
npm test
npm run build
```
