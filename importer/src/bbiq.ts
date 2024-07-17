/*
 * Copyright (C) 2023  David Kellner
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */


import {ImportQueue, type ImportQueueOptions, queuedEntityRepresentation} from './queue.ts';
import log, {logError} from './helpers/logger.ts';
import config from './helpers/config.ts';
import consumeImportQueue from './consumer/consumer.ts';
// eslint-disable-next-line import/no-internal-modules
import {hideBin} from 'yargs/helpers';
import process from 'node:process';
import {readFile} from 'node:fs/promises';
import yargs from 'yargs';


function createQueue({connection, test, failureQueue, queue}: BBIQArguments) {
	const queueOptions: Partial<ImportQueueOptions> = {
		connectionUrl: connection || config.queue?.connection,
		failureQueue: failureQueue === 'none' ? false : failureQueue,
		isPersistent: !test,
		queueName: queue
	};

	if (test) {
		// AMQP does not allow us to re-declare the same default queues `bookbrainz-import(-failures)` as non-persistent
		if (!queue) {
			queueOptions.queueName = 'bookbrainz-import-test';
		}
		if (!failureQueue) {
			queueOptions.failureQueue = 'bookbrainz-import-test-failures';
		}
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
		logError(error, errorMessage);
		exitCode = 1;
	}
	finally {
		if (await queue.close()) {
			log.debug('Import queue has been closed');
		}
	}

	return exitCode;
}


const {argv} = yargs(hideBin(process.argv))
	.scriptName('bbiq')
	.usage('BookBrainz Import Queue management\nUsage: $0 <command>')
	.help()
	.alias('help', 'h')
	.wrap(100)
	.option('connection', {
		alias: 'c',
		describe: 'Connection URL to an AMQP server (overrides config file)',
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
		describe: 'Name of the queue which stores failed imports ("none" to discard them)',
		requiresArg: true,
		type: 'string'
	})
	.option('test', {
		alias: 't',
		default: false,
		describe: 'Use the non-persistent test import queue',
		type: 'boolean'
	})
	.option('update', {
		alias: 'u',
		default: false,
		describe: 'Update existing imports which are still pending',
		type: 'boolean'
	})
	.command('consume', 'Await queued entities and insert them into the BB database', {}, (args) => {
		const queue = createQueue(args as BBIQArguments);
		process.on('SIGINT', async () => {
			log.info('Consumer has been terminated');
			await queue.close();
			log.debug('Import queue has been force-closed');
		});
		useQueue(queue, (q) => consumeImportQueue(q, {
			existingImportAction: args.update ? 'update pending' : 'skip'
		}), 'Failed to consume queue').then(process.exit);
	})
	.command('info', 'Show information about the import queue', {}, (args) => {
		const queue = createQueue(args as BBIQArguments);
		useQueue(queue, () => Promise.resolve()).then(process.exit);
	})
	.command('purge', 'Drop all entities from the import queue', {}, (args) => {
		const queue = createQueue(args as BBIQArguments);
		useQueue(queue, async (q) => {
			const result = await q.purge();
			log.info('Purged messages:', result.messageCount);
		}, 'Failed to purge queue').then(process.exit);
	})
	.command('push <files..>', 'Push JSON files into the import queue', {}, (args) => {
		const queue = createQueue(args as BBIQArguments);
		useQueue(queue, async (q) => {
			for (const path of args.files as string[]) {
				try {
					// eslint-disable-next-line no-await-in-loop -- Process multiple files
					const content = await readFile(path, {encoding: 'utf-8'});
					const entity = JSON.parse(content);
					const success = q.push(entity);
					if (success) {
						log.info(`Queued ${queuedEntityRepresentation(entity)}`);
					}
					else {
						log.error(`Failed to push ${queuedEntityRepresentation(entity)}`);
					}
				}
				catch (error) {
					logError(error, `Failed to read ${path}`);
				}
			}
		}).then(process.exit);
	})
	.demandCommand();


type BBIQArguments = Awaited<typeof argv>;
