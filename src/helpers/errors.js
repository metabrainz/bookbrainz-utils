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


import log from '../helpers/logger';


/**
 * CONNECTION_ERROR - Raised when unable to connect to the RMQ.
 * @type {string}
 **/
export const CONNECTION_ERROR = 'Cannot connect to the broker';

/**
 * CONNECTION_CLOSE_ERROR - Raised when unable to close a connect setup at RMQ.
 * @type {string}
 **/
export const CONNECTION_CLOSE_ERROR = 'Unable to close connection';

/**
 * CHANNEL_ERROR - Raised when unable to create a channel using RMQ connection.
 * @type {string}
 **/
export const CHANNEL_ERROR = 'Cannot create a channel';

/**
 * ASSERT_QUEUE_ERROR - Raised when unable to locate queue via the channel setup
 * @type {string}
 **/
export const ASSERT_QUEUE_ERROR = 'Cannot find the queue';

/**
 * QUEUE_ERROR - Raised when performing general operations on a queue.
 * @type {string}
 **/
export const QUEUE_ERROR = 'Error in queue handling';

/**
 * QUEUE_PUSH_ERROR - Raised when performing push operation on a queue.
 * @type {string}
 **/
export const QUEUE_PUSH_ERROR = 'Unable to push into the queue';

/**
 * UNDEFINED_VALUE - Raised when a variable is found undefined, when expected to
 * 		be otherwise.
 * @type {string}
 **/
export const UNDEFINED_VALUE = 'Undefined value found';

/**
 * SIZE_MISMATCH - Raised when array.length and provided size do not match.
 * @type {string}
 **/
export const SIZE_MISMATCH = 'Array sizes does not match';

/**
 * raiseError: Error function called to catch an error of a specific type.
 * @param {string} msg - The error message utility message (usually location).
 * @returns {function} - Takes in error message received and prints msg and err.
 */
export function raiseError(msg) {
	return (err) => {
		log.error(`[ERROR] ${msg} -- ${err}`);
		throw new Error(`[ERROR] ${msg}: ${err}`);
	};
}

/**
 * undefinedValue: Error function called when a value is found undefined.
 * @param {string} err - The error message received.
 */
export function undefinedValue(err) {
	raiseError(UNDEFINED_VALUE)(err);
}

/**
 * sizeMismatch: Error function called when there is a size mismatch in given
 * 		array and provided length.
 * @param {string} err - The error message received.
 */
export function sizeMismatch(err) {
	raiseError(SIZE_MISMATCH)(err);
}
