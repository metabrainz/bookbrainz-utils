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
import amqp from 'amqplib';
import log from './helpers/logger.ts';


/** Queue which stores parsed entities that have to be imported into the BookBrainz database. */
export class ImportQueue {
	constructor({
		connectionUrl = 'amqp://localhost',
		isPersistent = true,
		queueName = 'bookbrainz-import'
	}: Partial<ImportQueueOptions> = {}) {
		this.connectionUrl = connectionUrl;
		this.isPersistent = isPersistent;
		this.queueName = queueName;
	}

	/**
	 * Opens the connection to the AMQP server and creates a message channel.
	 * Ensures that our persistent import queue exists and creates it if necessary.
	 */
	async open() {
		this.connection = await amqp.connect(this.connectionUrl);
		this.channel = await this.connection.createChannel();
		return this.channel.assertQueue(this.queueName, {durable: this.isPersistent});
	}

	/** Closes the connection to the AMQP server. */
	async close() {
		// wait until the channel closes to guarantee that all sent messages went through
		await this.channel?.close();
		return this.connection?.close();
	}

	/** Appends the given entity to the import queue. */
	push(entity): boolean {
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
	 * Registers a consumer function for queued entities.
	 * Messages have to be acknowledged by the consumer.
	 */
	addConsumer(onMessage: (message: amqp.ConsumeMessage | null) => void) {
		// TODO: pre-process messages and pass already deserialized entities to the handler
		this.channel.consume(this.queueName, onMessage, {noAck: false});
	}

	/** Acknowledges the successful import of the entity from the given message. */
	acknowledge(message: amqp.Message) {
		this.channel.ack(message);
	}

	/** Drop all currently queued entities. */
	purge() {
		return this.channel.purgeQueue(this.queueName);
	}

	readonly queueName: string;

	private connectionUrl: string;

	private connection: amqp.Connection;

	private channel: amqp.Channel;

	private isPersistent: boolean;
}


export interface ImportQueueOptions {

	/** Connection URL to an AMQP server. */
	connectionUrl: string;

	/** Keep queued messages when the AMQP server stops. */
	isPersistent: boolean;

	/** Name of the queue which stores parsed entities that have to be imported. */
	queueName: string;
}
