"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sync_1 = require("./sync");
function parseArgs(argv) {
    const args = argv.slice(2);
    const opts = {
        queuePath: '',
        projectId: '',
        dryRun: false,
        mock: false,
        mockQueues: [],
        verbose: false,
    };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const eqIndex = arg.indexOf('=');
        const key = eqIndex === -1 ? arg : arg.slice(0, eqIndex);
        const value = eqIndex === -1 ? undefined : arg.slice(eqIndex + 1);
        switch (key) {
            case '--queue-path':
                opts.queuePath = value ?? args[++i];
                break;
            case '--project':
                opts.projectId = value ?? args[++i];
                break;
            case '--dry-run':
                opts.dryRun = true;
                break;
            case '--no-dry-run':
                opts.dryRun = false;
                break;
            case '--mock':
                opts.mock = true;
                break;
            case '--no-mock':
                opts.mock = false;
                break;
            case '--mock-queues':
                opts.mockQueues = (value ?? args[++i]).split(',');
                break;
            case '--verbose':
                opts.verbose = true;
                break;
            case '--no-verbose':
                opts.verbose = false;
                break;
            case '--help':
                printUsage();
                process.exit(0);
                break;
            default:
                console.error(`Unknown option: ${key}`);
                printUsage();
                process.exit(1);
        }
    }
    if (!opts.queuePath) {
        console.error('Error: --queue-path is required');
        printUsage();
        process.exit(1);
    }
    if (!opts.projectId && !opts.mock) {
        console.error('Error: --project is required when not using --mock');
        printUsage();
        process.exit(1);
    }
    return opts;
}
function printUsage() {
    console.log(`
Usage: tsx src/cli.ts [options]

Options:
  --queue-path <path>        Path to queue.yaml file (required)
  --project <id>          GCP project ID (required unless --mock)
  --dry-run / --no-dry-run   Preview changes without deleting (default: false)
  --mock / --no-mock         Use mock queues instead of GCP (default: false)
  --mock-queues <a,b,c>      Comma-separated mock queue names
  --verbose / --no-verbose   Log output (default: auto-enabled with --dry-run or --mock)
  --help                     Show this help message
`.trim());
}
async function main() {
    const opts = parseArgs(process.argv);
    const result = await (0, sync_1.sync)({
        queuePath: opts.queuePath,
        projectId: opts.projectId || undefined,
        dryRun: opts.dryRun,
        mock: opts.mock,
        mockQueues: opts.mockQueues.length > 0 ? opts.mockQueues : undefined,
        verbose: opts.verbose || undefined,
    });
    if (!opts.verbose && !opts.dryRun && !opts.mock) {
        console.log(JSON.stringify(result, null, 2));
    }
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
