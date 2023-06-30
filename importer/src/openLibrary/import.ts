import {Connection} from '../queue/index.ts'
// eslint-disable-next-line import/no-internal-modules
import {hideBin} from 'yargs/helpers';
import process from 'node:process';
import readLine from './producer/producer.ts';
import yargs from 'yargs';


const argv = yargs(hideBin(process.argv))
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

await readLine({base: argv.dump, id: 0, init: Connection.connect()});
