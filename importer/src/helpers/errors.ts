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


import log from './logger.ts';


/**
 * CONNECTION_ERROR - Raised when unable to connect to the RMQ.
 **/
export const CONNECTION_ERROR = 'Cannot connect to the broker';

/**
 * CONNECTION_CLOSE_ERROR - Raised when unable to close a connect setup at RMQ.
 **/
export const CONNECTION_CLOSE_ERROR = 'Unable to close connection';

/**
 * CHANNEL_ERROR - Raised when unable to create a channel using RMQ connection.
 **/
export const CHANNEL_ERROR = 'Cannot create a channel';

/**
 * ASSERT_QUEUE_ERROR - Raised when unable to locate queue via the channel setup
 **/
export const ASSERT_QUEUE_ERROR = 'Cannot find the queue';

/**
 * QUEUE_ERROR - Raised when performing general operations on a queue.
 **/
export const QUEUE_ERROR = 'Error in queue handling';

/**
 * QUEUE_PUSH_ERROR - Raised when performing push operation on a queue.
 **/
export const QUEUE_PUSH_ERROR = 'Unable to push into the queue';

/**
 * UNDEFINED_VALUE - Raised when a variable is found undefined, when expected to
 * 		be otherwise.
 **/
export const UNDEFINED_VALUE = 'Undefined value found';

/**
 * SIZE_MISMATCH - Raised when array.length and provided size do not match.
 **/
export const SIZE_MISMATCH = 'Array sizes does not match';

/**
 * INVALID_RECORD - Raised when automatic validation tests failed.
 **/
export const INVALID_RECORD = 'Record failed automated validation tests.';

/**
 * RECORD_ENTITY_NOT_FOUND - The type field of imported record is invalid.
 **/
export const RECORD_ENTITY_NOT_FOUND = 'Could not ascertain entity record';

/**
 * NONE - Signify that no error has occurred.
 **/
export const NONE = 'No errors occurred';

/**
 * TRANSACTION_ERROR - Signify that error occurred during DB transaction.
 **/
export const TRANSACTION_ERROR = 'Error occurred during DB transaction.';

/**
 * IMPORT_ERROR - Signify that error occurred during the import process.
 **/
export const IMPORT_ERROR = 'Error occurred during import process';

/**
 * importErrors - Encapsulate all import errors {INVALID_RECORD,
 * RECORD_ENTITY_NOT_FOUND,
 * TRANSACTION_ERROR}.
 **/
export const importErrors = {
	INVALID_RECORD,
	NONE,
	RECORD_ENTITY_NOT_FOUND,
	TRANSACTION_ERROR
};

/**
 * raiseError: Error function called to catch an error of a specific type.
 * @param msg - The error message utility message (usually location).
 * @returns Function that logs and throws the pre-configured message and the passed error.
 */
export function raiseError(msg: string) {
	return (err: any) => {
		log.error(`[ERROR] ${msg} -- ${err}`);
		throw new Error(`${msg}: ${err}`);
	};
}

/**
 * undefinedValue: Error function called when a value is found undefined.
 * @param {string} err - The error message received.
 */
export function undefinedValue(err: string) {
	return raiseError(UNDEFINED_VALUE)(err);
}

/**
 * sizeMismatch: Error function called when there is a size mismatch in given
 * 		array and provided length.
 * @param {string} err - The error message received.
 */
export function sizeMismatch(err: string) {
	return raiseError(SIZE_MISMATCH)(err);
}
