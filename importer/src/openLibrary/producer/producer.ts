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


import {type ImportQueue, queuedEntityRepresentation} from '../../queue.ts';
import log, {logError} from '../../helpers/logger.ts';
import parser, {type OLEntityType, mapEntityType} from './parser.ts';
import type {QueuedEntity} from 'bookbrainz-data/lib/types/parser.d.ts';
import {createReadStream} from 'node:fs';
import readline from 'node:readline';


/**
 * readLine - Function which takes in instanceArgs and processes them.
 * @param {Object} obj - Primary argument
 * @param {ImportQueue} obj.queue - Message queue connection
 * @param {number} obj.id - Numerical Id of the worker process running this
 * 		instance
 * @param {string} obj.base - This is path to the file to be processed
 **/
function readLine({base, id, queue}: {id: number; base: string; queue: ImportQueue}) {
	const fileName = base.split('/').pop();
	log.info(`[WORKER::${id}] Processing dump file '${fileName}'`);

	let lineNumber = 0;

	function parseLine(line: string): void {
		lineNumber++;
		try {
			// According to details at https://openlibrary.org/developers/dumps
			// Tab separated values in the following order
			// 		➜ type - type of record (/type/edition, /type/work etc.)
			// 		➜ key - unique key of the record. (/books/OL1M etc.)
			// 		➜ revision - revision number of the record
			// 		➜ last_modified - last modified timestamp
			// 		➜ JSON - the complete record in JSON format
			const record = line.split('\t');

			const source = 'OPENLIBRARY';
			const json = JSON.parse(record[4]);
			const OLType = record[0].split('/')[2] as OLEntityType;
			const entityType = mapEntityType(OLType);

			if (!entityType) {
				throw new Error(`Unsupported OpenLibrary entity type '${OLType}'`);
			}

			const data = parser(OLType, json);
			const originId = record[1].split('/')[2];
			const lastEdited = record[3];

			const entity: QueuedEntity = {
				data,
				entityType,
				lastEdited: lastEdited || data.lastEdited,
				originId: originId || data.originId,
				source
			};
			const success = queue.push(entity);

			if (success) {
				log.debug(`[WORKER::${id}] Pushing record #${lineNumber} ${queuedEntityRepresentation(entity)}`);
			}
			else {
				log.error(`[WORKER::${id}] Failed to push record #${lineNumber} ${queuedEntityRepresentation(entity)}`);
			}
		}
		catch (err) {
			log.error(`Parsing error: ${err}\n at ${fileName}:${lineNumber}`);
			log.debug(`Skipped: ${line}`);
		}
	}

	try {
		const inputStream = createReadStream(base);
		const rl = readline.createInterface({
			input: inputStream
		});

		rl.on('line', parseLine);

		return new Promise((resolve) => {
			// TODO: improve return value, we do no longer have worker threads
			rl.on('close', () => resolve({
				id,
				workerCount: lineNumber
			}));
		});
	}
	catch (error) {
		logError(error, `Failed to process '${fileName}'`);
		return Promise.resolve({
			id,
			workerCount: lineNumber
		});
	}
}

export default readLine;
