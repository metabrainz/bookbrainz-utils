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


import {ENTITY_TYPES} from 'bookbrainz-data/lib/types/entity.js';
import type {QueuedEntity} from 'bookbrainz-data/lib/types/parser.d.ts';
import {importErrors} from '../helpers/errors.ts';
import {importRecord} from '../helpers/orm.ts';
import {logError} from '../helpers/logger.ts';
import {queuedEntityRepresentation} from '../queue.ts';
import validate from './validators/index.ts';


// TODO: throw instead of returning errors
export default async function consumeRecord(record: QueuedEntity): Promise<{errMsg?: string, errorType: string}> {
	const {entityType} = record;
	if (!entityType || !ENTITY_TYPES.includes(entityType)) {
		return {errMsg: `Invalid entity type '${entityType}'`, errorType: importErrors.RECORD_ENTITY_NOT_FOUND};
	}

	const validationFunction = validate[entityType];
	if (!validationFunction(record.data)) {
		return {errMsg: 'Validation of the parsed entity failed', errorType: importErrors.INVALID_RECORD};
	}

	try {
		await importRecord(record);
	}
	catch (err) {
		logError(err, `Transaction for ${queuedEntityRepresentation(record)} failed`);
		return {errMsg: err, errorType: importErrors.TRANSACTION_ERROR};
	}

	return {errorType: importErrors.NONE};
}
