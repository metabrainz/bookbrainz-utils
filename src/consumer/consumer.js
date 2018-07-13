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


import * as Error from '../helpers/errors';
import BookBrainzData from 'bookbrainz-data';
import Promise from 'bluebird';
import {Queue} from '../queue';
import async from 'async';
import config from '../helpers/config';
import consumeRecord from './consumeRecord';
import log from '../helpers/logger';


/**
 * consumerPromise - Instance function called to consume from the RMQ queues
 * @param {Object} objArgs - Arguments passed
 * @param {number} objArgs.id - Worker Id
 * @param {Promise} objArgs.init - The connection promise to RMQ
 * @returns {Promise} - A never fulfilling promise, as consumer is supposed to
 * 		run forever
 **/
function consumerPromise({id, init}) {
	log.notice(`[WORKER::${id}] Running consumer number ${id}`);

	const importDb = BookBrainzData(config('database')).modules.import;
	const {retryLimit} = config('import');

	// A never resolving promise as consumer is supposed to run forever
	return new Promise(() => {
		const queue = new Queue(init);

		if (id !== 0 && !id) {
			Error.undefinedValue('Consumer instance:: Worker Id undefined');
		}

		function messageHandler(msg) {
			log.notice(`[CONSUMER::${id}] Received object.\
				\r Running message handler`);

			if (typeof msg === 'undefined' || !msg) {
				log.error('Empty Message received. Skipping.');
				return;
			}

			// Attempts left for this message
			let attemptsLeft = retryLimit;
			const record = JSON.parse(msg.content.toString());

			// Manages consume record retries
			async.doWhilst(
				// Function repeated upon transaction error for retries times
				// Manages async record consumption
				async () => {
					log.info('Running async function');
					const error = await consumeRecord({
						importDb,
						workerId: id,
						...record
					});

					switch (error) {
						case Error.NONE:
							log.info(
								`[CONSUMER::${id}] Read message successfully
								\r${record}`
							);
							queue.acknowledge(msg);
							attemptsLeft = 0;
							break;
						case Error.INVALID_RECORD:
						case Error.RECORD_ENTITY_NOT_FOUND:
							log.warning(
								`[CONSUMER::${id}] ${error} -\
								\r Skipping the errored record.`
							);
							queue.acknowledge(msg);
							attemptsLeft = 0;
							break;
						case Error.TRANSACTION_ERROR:
							log.warning(
								`[CONSUMER::${id}] ${error} Setting up for\
								\r reinsertion. Record for reference:
								\r ${record}`
							);
							attemptsLeft--;
							break;
						default: break;
					}
				},

				// Test whose return value if is false, stops the iteration
				// When number of attempts finish up, the test should return F
				() => attemptsLeft > 0,

				// Raise error in case of error
				Error.raiseError(Error.IMPORT_ERROR)
			);
		}
		// Connection related errors would be handled on the queue side
		return queue.consume(messageHandler);
	});
}

export default consumerPromise;
