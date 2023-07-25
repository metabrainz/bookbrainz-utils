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


import {Buffer} from 'node:buffer';
import {type ParsedEntity} from './parser.ts';
import amqp from 'amqplib';
import {delay} from './helpers/utils.ts';
import log from './helpers/logger.ts';


/** Queue which stores parsed entities that have to be imported into the BookBrainz database. */
export class ImportQueue {
	constructor({
		connectionUrl = 'amqp://localhost',
		isPersistent = true,
		prefetchLimit = 5,
		queueName = 'bookbrainz-import',
		failureQueue = false
	}: Partial<ImportQueueOptions> = {}) {
		this.connectionUrl = connectionUrl;
		this.isPersistent = isPersistent;
		this.prefetchLimit = prefetchLimit;
		this.queueName = queueName;
		if (failureQueue) {
			this.failureQueueName = failureQueue;
		}
	}

	/**
	 * Opens the connection to the AMQP server and creates a message channel.
	 * Ensures that our persistent import queue exists and creates it if necessary.
	 */
	async open() {
		this.connection = await amqp.connect(this.connectionUrl);
		this.channel = await this.connection.createChannel();
		await this.channel.prefetch(this.prefetchLimit);

		if (this.failureQueueName) {
			this.channel.assertQueue(this.failureQueueName, {durable: this.isPersistent});
		}

		return this.channel.assertQueue(this.queueName, {durable: this.isPersistent});
	}

	/** Closes the connection to the AMQP server. */
	async close(): Promise<boolean> {
		if (this.pendingMessages) {
			log.info(`${this.pendingMessages} pending messages still have to be acknowledged before closing...`);
			// limit accumulated delay for hopeless cases
			let gracePeriods = 10;
			// eslint-disable-next-line no-await-in-loop -- polling loop
			do {
				await delay(200);
			} while (this.pendingMessages && --gracePeriods);
		}

		// wait until the channel closes to guarantee that all sent messages went through
		await this.channel?.close();
		await this.connection?.close();

		return Boolean(this.connection);
	}

	/** Appends the given entity to the import queue. */
	push(entity: QueuedEntity): boolean {
		let message: string;
		try {
			message = JSON.stringify(entity);
		}
		catch (error) {
			log.error(`Failed to serialize entity ${entity.originId}: ${error}`);
			return false;
		}

		return this.channel.sendToQueue(this.queueName, Buffer.from(message), {
			persistent: this.isPersistent
		});
	}

	/**
	 * Registers a consumer function for queued entities which is called with already parsed messages.
	 * Acknowledgement of messages happens automatically according to the returned success value of the consumer.
	 */
	onData(consumer: (entity: QueuedEntity) => Promise<boolean>) {
		return this.channel.consume(this.queueName, async (message) => {
			let entity: QueuedEntity;
			this.pendingMessages++;
			try {
				entity = JSON.parse(message.content.toString());
			}
			catch (error) {
				log.warn('Skipping invalid message:', error.message);
				// acknowledge invalid message, otherwise it will be requeued
				this.channel.ack(message);
				this.pendingMessages--;
				return;
			}

			const success = await consumer(entity);

			// Acknowledge all consumed messages and put problematic messages into a separate queue (if configured).
			// We do this to avoid a requeue/redelivery loop which occurs if the consumer never accepts the entity.
			this.channel.ack(message);
			if (!success && this.failureQueueName) {
				this.channel.sendToQueue(this.failureQueueName, message.content, {
					persistent: this.isPersistent
				});
			}
			this.pendingMessages--;
		});
	}

	/** Drops all currently queued entities. */
	purge() {
		return this.channel.purgeQueue(this.queueName);
	}

	readonly queueName: string;

	readonly failureQueueName?: string;

	private connectionUrl: string;

	private connection: amqp.Connection;

	private channel: amqp.Channel;

	private isPersistent: boolean;

	private prefetchLimit: number;

	private pendingMessages = 0;
}


export interface ImportQueueOptions {

	/** Connection URL to an AMQP server. */
	connectionUrl: string;

	/** Keep queued messages when the AMQP server stops. */
	isPersistent: boolean;

	/** Maximum number of sent messages which are awaiting acknowledgement. */
	prefetchLimit: number;

	/** Name of the queue which stores parsed entities that have to be imported. */
	queueName: string;

	/** Name of the queue which stores messages of failed imports. Set to `false` to discard these immediately. */
	failureQueue: string | false;
}


// TODO: drop redundant properties which are present in `data` and at the top level
export type QueuedEntity = {
	data: ParsedEntity;
} & Pick<ParsedEntity, 'entityType' | 'lastEdited' | 'originId' | 'source'>;
