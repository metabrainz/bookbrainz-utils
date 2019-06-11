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
import _ from 'lodash';
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

	const orm = BookBrainzData(config('database'));
	const importRecord = _.partial(orm.func.imports.createImport, orm);
	const {retryLimit} = config('import');

	// A never resolving promise as consumer is supposed to run forever
	return new Promise(() => {
		const queue = new Queue(init);

		if (id !== 0 && !id) {
			Error.undefinedValue('Consumer instance:: Worker Id undefined');
		}

		function messageHandler(msg) {
			log.notice(`[CONSUMER::${id}] Received object.\nRunning message handler`);

			if (typeof msg === 'undefined' || !msg) {
				log.error('Empty Message received. Skipping.');
				return;
			}

			// Attempts left for this message
			let attemptsLeft = retryLimit;
			const record = JSON.parse(msg.content.toString());

			// Manages consume record retries
			async.whilst(
				// Test whose return value if is false, stops the iteration
				// When number of attempts finish up, the test should return F
				() => attemptsLeft > 0,

				// Function repeated upon transaction error for retries times
				// Manages async record consumption
				async cb => {
					if (attemptsLeft < retryLimit) {
						log.info(`
						\r ##################################################
						\r Restarting import process....
						\r ##################################################
						`);
					}

					log.info('Running async function');
					const {errorType, errMsg} = await consumeRecord({
						importRecord,
						workerId: id,
						...record
					});

					switch (errorType) {
						case Error.NONE:
							// On success, we don't need to retry again
							attemptsLeft = 0;
							log.info(`[CONSUMER::${id}] Read message successfully \n${record}`);
							queue.acknowledge(msg);
							break;

						case Error.INVALID_RECORD:
						case Error.RECORD_ENTITY_NOT_FOUND:
							// In case of invalid records, we don't try again
							attemptsLeft = 0;
							log.warning(
								`[CONSUMER::${id}] ${errorType} -\
								\r Hence skipping the errored record.`
							);
							// As we're not retrying, we acknowledge the message
							queue.acknowledge(msg);
							throw new Error(`${errorType} :: ${errMsg}`);

						case Error.TRANSACTION_ERROR:
							// In case of transaction errors, we retry a number
							// 		of times before giving up
							attemptsLeft--;

							// Issue a warning in case of transaction error
							log.warning(
								`[CONSUMER::${id}] ${errorType} Setting up for reinsertion.
								\rRecord for reference: \n${msg} \nAttempts left: ${attemptsLeft}`
							);

							// If no more attempts left, acknowledge the message
							if (!attemptsLeft) {
								log.info('No more attempts left. Acknowledging the message.');
								queue.acknowledge(msg);
								throw new Error(`${errorType} :: ${errMsg}`);
							}

							log.info(attemptsLeft);
							break;

						default: {
							throw new Error('Undefined response while importing');
						}
					}

					// In case of no error, return back the present count of
					//		attemptsLeft
					cb(null, attemptsLeft);
				},

				// Raise error in case of error
				Error.raiseError(`${Error.IMPORT_ERROR} \n${JSON.stringify(record)}`)
			);
		}
		// Connection related errors would be handled on the queue side
		return queue.consume(messageHandler);
	});
}

export default consumerPromise;
