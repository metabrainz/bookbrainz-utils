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


import type {QueuedEntity} from 'bookbrainz-data/lib/types/parser.d.ts';
import _ from 'lodash';
import {importErrors} from '../helpers/errors.ts';
import {importRecord} from '../helpers/orm.ts';
import log from '../helpers/logger.ts';
import validate from './validators/index.ts';


function getValidationData(record: QueuedEntity) {
	if (_.isEmpty(record)) {
		return null;
	}

	return record.data;
}

export default async function consumeRecord(record: QueuedEntity) {
	const {entityType} = record;
	const validationData = getValidationData(record);
	const validationFunction = validate[entityType];

	if (!validationFunction(validationData)) {
		return {errorType: importErrors.INVALID_RECORD};
	}

	try {
		await importRecord({entityType, ...record.data});
	}
	catch (err) {
		log.warn(`[TRANSACTION::${entityType}] ${err}`);
		return {errMsg: err, errorType: importErrors.TRANSACTION_ERROR};
	}

	return {errorType: importErrors.NONE};
}
