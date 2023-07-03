import amqp from 'amqplib'
// eslint-disable-next-line import/no-internal-modules
import {hideBin} from 'yargs/helpers';
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

async function processDump(dumpPath: string) {
	let connection: amqp.Connection;
	let exitCode = 0;

	try {
		console.debug('Establishing AMQP connection...');
		connection = await amqp.connect('amqp://localhost');
		console.debug('AMQP connection established, processing dump...');
		await readLine({base: dumpPath, id: 0, init: connection});
		console.debug('Dump has been processed');
	} catch (error) {
		console.error('Failed to process dump:', error);
		exitCode = 1;
	} finally {
		if (connection) {
			connection.close();
		}
	}

	return exitCode;
}

processDump(dump).then(process.exit);
