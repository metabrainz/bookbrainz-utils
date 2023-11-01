/*
 * Copyright (C) 2018  Shivam Tripathi
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


import * as Errors from '../helpers/errors.ts';
import {type ImportQueue, queuedEntityRepresentation} from '../queue.ts';
import log, {logError} from '../helpers/logger.ts';
import type {QueuedEntity} from 'bookbrainz-data/lib/types/parser.d.ts';
import consumeRecord from './consumeRecord.ts';


/**
 * consumerPromise - Instance function called to consume from the RMQ queues
 * @param {Object} objArgs - Arguments passed
 * @param {number} objArgs.id - Worker Id
 * @param {ImportQueue} objArgs.queue - Message queue connection
 * @returns {Promise} - A never fulfilling promise, as consumer is supposed to
 * 		run forever
 **/
function consumerPromise({id, queue}: {id: number; queue: ImportQueue}) {
	log.info(`[WORKER::${id}] Running consumer number ${id}`);

	// A never resolving promise as consumer is supposed to run forever
	return new Promise<never>(() => {
		if (id !== 0 && !id) {
			Errors.undefinedValue('Consumer instance:: Worker Id undefined');
		}

		async function entityHandler(record: QueuedEntity) {
			log.info(`[CONSUMER::${id}] Received ${queuedEntityRepresentation(record)}, running handler...`);

			try {
				const {errorType, errMsg} = await consumeRecord(record);

				switch (errorType) {
					case Errors.NONE:
						log.info(`[CONSUMER::${id}] Successfully imported ${queuedEntityRepresentation(record)}`);
						return true;

					case Errors.INVALID_RECORD:
					case Errors.RECORD_ENTITY_NOT_FOUND:
						// In case of invalid records, we don't try again
						log.error(`[CONSUMER::${id}] ${errMsg} [skipping ${queuedEntityRepresentation(record)}]`);
						return false;

					case Errors.TRANSACTION_ERROR:
						return false;

					default: {
						throw new Error('Undefined response while importing');
					}
				}
			}
			catch (err) {
				logError(err);
				log.debug(`Error occurred during import of ${queuedEntityRepresentation(record)}`);
			}

			return false;
		}

		// Connection related errors would be handled on the queue side
		queue.onData(entityHandler);
		log.debug('Consumer registered, waiting for messages...');
	});
}

export default consumerPromise;
