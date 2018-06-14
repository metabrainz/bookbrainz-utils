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
import amqp from 'amqplib';
import {isNotDefined} from '../helpers/utils';
import log from '../helpers/logger';


/**
 * QUEUE_NAME - Queue name for importing data.
 * @type {string} QUEUE_NAME
 **/
export const QUEUE_NAME = 'bookbrainz-import';

/**
 * Connection - Object containing functions to create and close RMQ connections.
 * @type {Object} Connection
 * @property {function} connect - Returns a connection object promise
 * @property {function} shutdown - Takes in a connection promise and closes the
 * 		connection
 **/
export const Connection = {
	connect: function connect() {
		let connection = null;
		try {
			connection = amqp.connect('amqp://localhost');
		}
		catch (err) {
			Error.raiseError(Error.CONNECTION_ERROR)(err);
		}
		return connection;
	},
	shutdown: async function shutdown(connectionPromise) {
		if (isNotDefined(connectionPromise)) {
			Error.undefinedValue('Connection.shutdown:: connectionPromise');
			return null;
		}

		try {
			const connection = await connectionPromise;
			connection.close();
			return true;
	}
		catch (err) {
			Error.raiseError(Error.CONNECTION_CLOSE_ERROR);
			return false;
		}
	}
};

/** Class representing a RMQ Queue. */
export class Queue {
	/**
     * Create a channel promise
     * @param {Promise} connectionPromise - Connection promise
     */
	constructor(connectionPromise) {
		if (isNotDefined(connectionPromise)) {
			Error.undefinedValue('Queue.constructor:: connectionPromise');
			return null;
		}
		this.channelPromise = connectionPromise
			.then(conn => conn.createChannel())
			.catch(Error.raiseError(Error.CHANNEL_ERROR));
	}

	/**
     * Push a message into the queue
     * @param {string} msg - The string containing message to be pushed into RMQ
     */
	async push(msg) {
		if (isNotDefined(msg)) {
			log.error('Invalid message! Skipping.');
			return;
		}

		// Serializing the JSON Object
		// In this architecture, it is assumed that data is passed as JSON
		// 		objects are passed from the producers to consumers
		const serializedMessage = JSON.stringify(msg);

		if (isNotDefined(this.channelPromise)) {
			Error.undefinedValue('Queue.push:: undefined channel.');
		}

		try {
			const channel = await this.channelPromise;

			if (!channel) {
				Error.undefinedValue(
					'Queue.push:: Unable to get channel from promise.'
				);
			}

			const queueAssertion =
				await channel.assertQueue(QUEUE_NAME, {durable: true});

			if (!queueAssertion) {
						Error.undefinedValue(
							'Queue.push:: Could not assert queue.'
						);
					}

			// try-catch to get specific error message
					try {
						channel.sendToQueue(
							QUEUE_NAME,
					/* eslint-disable */
					new Buffer.from(serializedMessage),
					/* eslint-enable */
							{persistent: true}
						);
					}
					catch (err) {
						Error.raiseError(Error.QUEUE_PUSH_ERROR)(err);
					}
		}
		catch (err) {
			Error.raiseError(Error.QUEUE_ERROR)(err);
		}
	}

	/**
     * consume -
     * @param {function} messageHandler - function to be called upon consuming
	 * 		a message
	 * @returns {Promise} - Channel promise state
     */
	consume(messageHandler) {
		if (isNotDefined(this.channelPromise)) {
			Error.undefinedValue('Queue.pop:: undefined channel.');
		}

		return this.channelPromise.then(channel => {
			if (isNotDefined(channel)) {
				Error.undefinedValue(
					'Queue.pop:: Unable to get channel from promise.'
				);
			}
			return channel.assertQueue(QUEUE_NAME, {durable: true})
				.then((ok) => {
					if (isNotDefined(ok)) {
						Error.undefinedValue(
							'Queue.pop:: Could not assert queue.'
						);
					}

					return channel.consume(
						QUEUE_NAME,
						messageHandler,
						{noAck: false}
					);
				});
		}).catch(Error.raiseError(Error.QUEUE_ERROR));
	}

	/**
     * Acknowledge receiving of a message
     * @param {Object} msg - The message object to be acknowledged
     */
	acknowledge(msg) {
		log.debug('Acknowledging message', msg.content.toString());
		this.channelPromise.then(channel => channel.ack(msg));
	}
}
