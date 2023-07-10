import {ImportQueue, type ImportQueueOptions} from '../queue.ts';
import consumerPromise from './consumer.ts';
// eslint-disable-next-line import/no-internal-modules
import {hideBin} from 'yargs/helpers';
import log from '../helpers/logger.ts';
import process from 'node:process';
import yargs from 'yargs';


// eslint-disable-next-line node/no-sync -- name parseSync is a false positive
const {connection, purge, test} = yargs(hideBin(process.argv))
	.help()
	.option('connection', {
		alias: 'c',
		describe: 'Connection URL to an AMQP server.',
		type: 'string'
	})
	.option('purge', {
		alias: 'p',
		default: false,
		describe: 'Drop all entities from the import queue.',
		type: 'boolean'
	})
	.option('test', {
		alias: 't',
		default: false,
		describe: 'Use the non-persistent test import queue.',
		type: 'boolean'
	})
	.alias('help', 'h')
	.parseSync();

async function consumeQueuedEntities() {
	const queueOptions: Partial<ImportQueueOptions> = {
		connectionUrl: connection,
		isPersistent: !test
	};

	if (test) {
		// AMQP does not allow us to re-declare the same queue as (non-)persistent
		queueOptions.queueName = 'bookbrainz-import-test';
	}

	const queue = new ImportQueue(queueOptions);
	let exitCode = 0;

	process.on('SIGINT', async () => {
		log.info('Consumer has been terminated');
		await queue.close();
		log.debug('Queue has been closed');
	});

	try {
		const queueInfo = await queue.open();
		log.info('Import queue has been opened:', queueInfo);
		if (purge) {
			const result = await queue.purge();
			log.info('Purged messages:', result.messageCount);
		}
		else {
			await consumerPromise({id: 0, queue});
		}
	}
	catch (error) {
		log.error('Failed to consume queue:', error);
		exitCode = 1;
	}
	finally {
		await queue.close();
		log.debug('Queue has been closed');
	}

	return exitCode;
}

consumeQueuedEntities().then(process.exit);
