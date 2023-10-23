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


import parser, {type OLEntityType, mapEntityType} from './parser.ts';
import {type ImportQueue} from '../../queue.ts';
import fs from 'node:fs';
import log from '../../helpers/logger.ts';
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

	const rl = readline.createInterface({
		input: fs.createReadStream(base)
	});

	let count = 0;

	rl.on('line', line => {
		count++;
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

			const success = queue.push({
				data,
				entityType,
				lastEdited: lastEdited || data.lastEdited,
				originId: originId || data.originId,
				source
			});

			if (success) {
				log.debug(`[WORKER::${id}] Pushing record #${count} (${originId})`);
			}
			else {
				log.error(`[WORKER::${id}] Failed to push record #${count} (${originId})`);
			}
		}
		catch (err) {
			log.error(`Parsing error: ${err}\n at ${fileName}:${count}`);
			log.debug(`Skipped: ${line}`);
		}
	});

	return new Promise((resolve) => {
		rl.on('close', () => resolve({
			id,
			workerCount: count
		}));
	});
}

export default readLine;
