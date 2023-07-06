import {ImportQueue} from '../queue.ts';
// eslint-disable-next-line import/no-internal-modules
import {hideBin} from 'yargs/helpers';
import log from '../helpers/logger.ts';
import process from 'node:process';
import readLine from './producer/producer.ts';
import yargs from 'yargs';


const {dump} = yargs(hideBin(process.argv))
	.help()
	.option('dump', {
		alias: 'd',
		demandOption: true,
		describe: 'Path to an OpenLibrary dump file.',
		nargs: 1,
		requiresArg: true,
		type: 'string'
	})
	.alias('help', 'h')
	.parseSync();

async function importDump(dumpPath: string) {
	const queue = new ImportQueue();
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
