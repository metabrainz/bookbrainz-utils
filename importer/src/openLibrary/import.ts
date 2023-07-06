import {ImportQueue, type ImportQueueOptions} from '../queue.ts';
// eslint-disable-next-line import/no-internal-modules
import {hideBin} from 'yargs/helpers';
import log from '../helpers/logger.ts';
import process from 'node:process';
import readLine from './producer/producer.ts';
import yargs from 'yargs';


// eslint-disable-next-line node/no-sync -- name parseSync is a false positive
const {dump, test, connection} = yargs(hideBin(process.argv))
	.help()
	.option('connection', {
		alias: 'c',
		describe: 'Connection URL to an AMQP server.',
		type: 'string'
	})
	.option('dump', {
		alias: 'd',
		demandOption: true,
		describe: 'Path to an OpenLibrary dump file.',
		nargs: 1,
		requiresArg: true,
		type: 'string'
	})
	.option('test', {
		alias: 't',
		default: false,
		describe: 'Perform a non-persistent test import.',
		type: 'boolean'
	})
	.alias('help', 'h')
	.parseSync();

async function importDump(dumpPath: string) {
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

	try {
		const queueInfo = await queue.open();
		log.info('Import queue has been opened:', queueInfo);
		await readLine({base: dumpPath, id: 0, queue});
		log.info('Dump has been processed');
	}
	catch (error) {
		log.error('Failed to process dump:', error);
		exitCode = 1;
	}
	finally {
		await queue.close();
	}

	return exitCode;
}

importDump(dump).then(process.exit);
