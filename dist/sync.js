"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sync = sync;
const tasks_1 = require("@google-cloud/tasks");
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
const js_yaml_2 = require("js-yaml");
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
];
function parseQueueYaml(filePath) {
    const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
    const parsed = (0, js_yaml_1.load)(content);
    if (!parsed?.queue || !Array.isArray(parsed.queue)) {
        return [];
    }
    return parsed.queue.map(q => q.name);
}
async function listAllQueues(client, projectId) {
    const queueNames = [];
    for await (const location of client.listLocationsAsync({ name: `projects/${projectId}` })) {
        const locationName = location.name;
        for await (const queue of client.listQueuesAsync({ parent: locationName })) {
            const fullName = queue.name;
            const shortName = fullName.split('/').pop();
            queueNames.push(shortName);
        }
    }
    return queueNames;
}
async function deleteQueue(client, projectId, location, queueName) {
    const name = client.queuePath(projectId, location, queueName);
    await client.deleteQueue({ name });
}
async function deleteQueues(client, projectId, queueNames) {
    for await (const location of client.listLocationsAsync({ name: `projects/${projectId}` })) {
        const locationName = location.name;
        for await (const queue of client.listQueuesAsync({ parent: locationName })) {
            const fullName = queue.name;
            const shortName = fullName.split('/').pop();
            if (queueNames.includes(shortName)) {
                const locationId = locationName.split('/').pop();
                await deleteQueue(client, projectId, locationId, shortName);
            }
        }
    }
}
async function sync(params) {
    const { queuePath: queueFilePath, projectId, dryRun = false, mock = false } = params;
    const verbose = params.verbose ?? (dryRun || mock);
    if (!mock && !projectId) {
        throw new Error('projectId is required when mock is false');
    }
    const desiredQueues = parseQueueYaml(queueFilePath);
    let discoveredQueues;
    if (mock) {
        discoveredQueues = [...(params.mockQueues ?? MOCK_QUEUES)];
    }
    else {
        const client = new tasks_1.CloudTasksClient();
        discoveredQueues = await listAllQueues(client, projectId);
    }
    const desiredSet = new Set(desiredQueues);
    const remaining = discoveredQueues.filter(q => desiredSet.has(q) || q === 'default');
    const deleted = discoveredQueues.filter(q => !desiredSet.has(q) && q !== 'default');
    if (!dryRun && !mock && deleted.length > 0) {
        const client = new tasks_1.CloudTasksClient();
        await deleteQueues(client, projectId, deleted);
    }
    if (verbose) {
        console.log((0, js_yaml_2.dump)({ remaining, deleted }, dryRun ? {} : { flowLevel: 1 }));
    }
    return { remaining, deleted };
}
