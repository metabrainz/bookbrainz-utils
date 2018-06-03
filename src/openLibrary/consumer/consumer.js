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


import * as Error from '../../helpers/errors';
import Promise from 'bluebird';
import {Queue} from '../../queue';
import {isNotDefined} from '../../helpers/utils';
import log from '../../helpers/logger';


/**
 * consumerPromise - Instance function called to consume from the RMQ queues
 * @param {Object} objArgs - Arguments passed
 * @param {number} objArgs.id - Worker Id
 * @param {Promise} init - The connection promise to RMQ
 * @returns {Promise} - A never fulfilling promise, as consumer is supposed to
 * 		run forever
 **/
function consumerPromise({id, init}) {
	// A never resolving promise as consumer is supposed to run forever
	return new Promise(() => {
		const queue = new Queue(init);

		if (id !== 0 && isNotDefined(id)) {
			Error.undefinedValue('Consumer instance:: Worker Id undefined');
		}

		log.info(`[WORKER::${id}] Running consumer function.`);

		function messageHandler(msg) {
			if (typeof msg === 'undefined' || !msg) {
				log.error('Empty Message received. Skipping.');
				return;
			}
			// TODO : Implement import validation and handling function
			log.info(
				`[WORKER::${id}] Read message:: ${msg.content.toString()}`
			);
			queue.acknowledge(msg);
		}

		// Connection related errors would be handled on the queue side
		queue.consume(messageHandler);
	});
}

export default consumerPromise;
