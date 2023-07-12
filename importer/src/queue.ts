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
import log from './helpers/logger.ts';


/** Queue which stores parsed entities that have to be imported into the BookBrainz database. */
export class ImportQueue {
	constructor({
		connectionUrl = 'amqp://localhost',
		isPersistent = true,
		prefetchLimit = 5,
		queueName = 'bookbrainz-import'
	}: Partial<ImportQueueOptions> = {}) {
		this.connectionUrl = connectionUrl;
		this.isPersistent = isPersistent;
		this.prefetchLimit = prefetchLimit;
		this.queueName = queueName;
	}

	/**
	 * Opens the connection to the AMQP server and creates a message channel.
	 * Ensures that our persistent import queue exists and creates it if necessary.
	 */
	async open() {
		this.connection = await amqp.connect(this.connectionUrl);
		this.channel = await this.connection.createChannel();
		await this.channel.prefetch(this.prefetchLimit);
		return this.channel.assertQueue(this.queueName, {durable: this.isPersistent});
	}

	/** Closes the connection to the AMQP server. */
	async close() {
		// wait until the channel closes to guarantee that all sent messages went through
		await this.channel?.close();
		return this.connection?.close();
	}

	/** Appends the given entity to the import queue. */
	push(entity: QueuedEntity): boolean {
		let message: string;
		try {
			message = JSON.stringify(entity);
		}
		catch (error) {
			// TODO: also log entity ID
			log.error(`Failed to serialize entity: ${error}`);
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
			try {
				entity = JSON.parse(message.content.toString());
			}
			catch (error) {
				log.warn('Skipping invalid message:', error.message);
				// acknowledge invalid message, otherwise it will be requeued
				this.channel.ack(message);
				return;
			}

			const success = await consumer(entity);

			if (success) {
				this.channel.ack(message);
			}
			else {
				this.channel.nack(message);
			}
		});
	}

	/** Drops all currently queued entities. */
	purge() {
		return this.channel.purgeQueue(this.queueName);
	}

	readonly queueName: string;

	private connectionUrl: string;

	private connection: amqp.Connection;

	private channel: amqp.Channel;

	private isPersistent: boolean;

	private prefetchLimit: number;
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
}


// TODO: drop redundant properties which are present in `data` and at the top level
export type QueuedEntity = {
	data: ParsedEntity;
} & Pick<ParsedEntity, 'entityType' | 'lastEdited' | 'originId' | 'source'>;
