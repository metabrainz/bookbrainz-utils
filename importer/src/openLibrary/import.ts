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
		// TODO: process always hangs above as soon as the call to `readLine` is present!?
		// It does not matter whether the AMQP server is up or not in this scenario.
		console.debug('AMQP connection established, processing dump...');
		await readLine({base: dumpPath, id: 0, init: connection});
		console.debug('Dump has been processed');
	} catch (error) {
		// Unfortunately catching connection errors becomes impossible as soon as the call to `readLine` is present.
		// It does not matter that we never even get to this line because the process hangs if there is no RabbitMQ server.
		// If we comment out the `readLine` call, the error message is caught and logged as expected.
		// Apparently `amqplib` is silently swallowing errors in certain cases because of it's use of bluebird promises:
		// https://github.com/amqp-node/amqplib/issues/334
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
