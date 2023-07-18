import {ImportQueue, type ImportQueueOptions} from './queue.ts';
import consumerPromise from './consumer/consumer.ts';
// eslint-disable-next-line import/no-internal-modules
import {hideBin} from 'yargs/helpers';
import log from './helpers/logger.ts';
import process from 'node:process';
import yargs from 'yargs';


const {argv} = yargs(hideBin(process.argv))
	.scriptName('bbiq')
	.usage('BookBrainz Import Queue management\nUsage: $0 <command>')
	.help()
	.alias('help', 'h')
	.wrap(100)
	.option('connection', {
		alias: 'c',
		describe: 'Connection URL to an AMQP server',
		type: 'string'
	})
	.option('queue', {
		alias: 'q',
		describe: 'Name of the queue which stores pending imports',
		requiresArg: true,
		type: 'string'
	})
	.option('failure-queue', {
		alias: 'f',
		describe: 'Name of the queue which stores failed imports (discarded by default)',
		requiresArg: true,
		type: 'string'
	})
	.option('test', {
		alias: 't',
		default: false,
		describe: 'Use the non-persistent test import queue',
		type: 'boolean'
	})
	.command('consume', 'Await queued entities and insert them into the BB database', {}, (args) => {
		const queue = createQueue(args as BBIQArguments);
		process.on('SIGINT', async () => {
			log.info('Consumer has been terminated');
			await queue.close();
			log.debug('Queue has been closed');
		});
		useQueue(queue, (queue) => consumerPromise({id: 0, queue}), 'Failed to consume queue').then(process.exit);
	})
	.command('info', 'Show information about the import queue', {}, (args) => {
		const queue = createQueue(args as BBIQArguments);
		useQueue(queue, () => Promise.resolve()).then(process.exit);
	})
	.command('purge', 'Drop all entities from the import queue', {}, (args) => {
		const queue = createQueue(args as BBIQArguments);
		useQueue(queue, async (queue) => {
			const result = await queue.purge();
			log.info('Purged messages:', result.messageCount);
		}, 'Failed to purge queue').then(process.exit);
	})
	.demandCommand();


type BBIQArguments = Awaited<typeof argv>;

function createQueue({connection, test, failureQueue, queue}: BBIQArguments) {
	const queueOptions: Partial<ImportQueueOptions> = {
		connectionUrl: connection,
		failureQueue: failureQueue || false,
		isPersistent: !test,
		queueName: queue
	};

	if (test && !queue) {
		// AMQP does not allow us to re-declare the same default queue `bookbrainz-import` as non-persistent
		queueOptions.queueName = 'bookbrainz-import-test';
	}

	return new ImportQueue(queueOptions);
}

async function useQueue(
	queue: ImportQueue,
	task: (queue: ImportQueue) => Promise<void>,
	errorMessage = 'Failed to use queue'
) {
	let exitCode = 0;

	try {
		const queueInfo = await queue.open();
		log.info('Import queue has been opened:', queueInfo);
		await task(queue);
	}
	catch (error) {
		log.error(errorMessage + ':', error);
		exitCode = 1;
	}
	finally {
		if (await queue.close()) {
			log.debug('Import queue has been closed');
		}
	}

	return exitCode;
}
