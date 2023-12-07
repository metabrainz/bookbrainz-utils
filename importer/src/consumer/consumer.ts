/*
 * Copyright (C) 2018  Shivam Tripathi
 *               2023  David Kellner
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


import {type ImportQueue, queuedEntityRepresentation} from '../queue.ts';
import log, {logError} from '../helpers/logger.ts';
import {ENTITY_TYPES} from 'bookbrainz-data/lib/types/entity.js';
import type {ImportOptions} from 'bookbrainz-data/lib/func/imports/create-import.js';
import type {QueuedEntity} from 'bookbrainz-data/lib/types/parser.d.ts';
import {importRecord} from '../helpers/orm.ts';
import validate from './validators/index.ts';


/**
 * Infinitely running import queue consumer function which registers an entity import handler.
 * @param {ImportQueue} queue - The import queue the consumer should listen to.
 * @param {ImportOptions} [importOptions] - Options which should be passed to the importer function.
 * @returns {Promise<never>} A never fulfilling promise, as consumer is supposed to run forever.
 */
export default function consumeImportQueue(queue: ImportQueue, importOptions?: ImportOptions): Promise<never> {
	log.debug('Running consumer...');

	return new Promise<never>(() => {
		async function entityHandler(record: QueuedEntity) {
			const entityRepresentation = queuedEntityRepresentation(record);
			log.debug(`Received ${entityRepresentation}, running handler...`);

			try {
				const {entityType} = record;
				if (!entityType || !ENTITY_TYPES.includes(entityType)) {
					log.error(`Invalid entity type '${entityType}', skipping ${entityRepresentation}`);
					return false;
				}

				const validationFunction = validate[entityType];
				if (!validationFunction(record.data)) {
					log.error(`Validation of the parsed entity failed, skipping ${entityRepresentation}`);
					return false;
				}

				try {
					const {status, importId} = await importRecord(record, importOptions);
					if (status === 'created pending' || status === 'updated pending' || status === 'updated accepted') {
						log.info(`Successfully ${status} import #${importId} ${entityRepresentation}`);
					}
					else {
						log.info(`${entityRepresentation} already exists as import #${importId} (${status})`);
					}
					return true;
				}
				catch (err) {
					logError(err, `Transaction for ${entityRepresentation} failed`);
					return false;
				}
			}
			catch (err) {
				logError(err, `Unexpected error occurred during import of ${entityRepresentation}`);
				return false;
			}
		}

		queue.onData(entityHandler);
		log.info('Consumer registered, waiting for messages...');
	});
}
