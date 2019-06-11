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

import _ from 'lodash';
import {importErrors} from '../helpers/errors';
import log from '../helpers/logger';
import validate from './validators';

function getValidationData(record) {
	if (_.isEmpty(record)) {
		return null;
	}

	return {
		workerId: record.workerId,
		...record.data
	};
}

export default async function consumeRecord({entityType, importRecord, ...record}) {
	const validationData = getValidationData(record);
	const validationFunction = validate[entityType];

	if (!validationFunction(validationData)) {
		return {errorType: importErrors.INVALID_RECORD};
	}

	try {
		await importRecord({entityType, ...record.data});
	} catch (err) {
		log.warning(`[TRANSACTION::${entityType}] ${err}`);
		return {errMsg: err, errorType: importErrors.TRANSACTION_ERROR};
	}

	return {errorType: importErrors.NONE};
}
