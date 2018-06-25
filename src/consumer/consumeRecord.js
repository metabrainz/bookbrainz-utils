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


import {entityTypes} from '../helpers/utils';
import {importErrors} from '../helpers/errors';
import validate from './validators';


function consumeCreator(record) {
	if (!validate.creator(record)) {
		return importErrors.INVALID_RECORD;
	}
	// Use bookbrainz-data add import of the given type and return relevant err
	return null;
}

function consumeEdition(record) {
	if (!validate.edition(record)) {
		return importErrors.INVALID_RECORD;
	}
	// Use bookbrainz-data add import of the given type and return relevant err
	return null;
}

function consumePublication(record) {
	if (!validate.publication(record)) {
		return importErrors.INVALID_RECORD;
	}
	// Use bookbrainz-data add import of the given type and return relevant err
	return null;
}

function consumePublisher(record) {
	if (!validate.publisher(record)) {
		return importErrors.INVALID_RECORD;
	}
	// Use bookbrainz-data add import of the given type and return relevant err
	return null;
}

function consumeWork(record) {
	if (!validate.work(record)) {
		return importErrors.INVALID_RECORD;
	}
	// Use bookbrainz-data add import of the given type and return relevant err
	return null;
}

export default async function consumeRecord({type, ...record}) {
	let error = importErrors.NONE;
	switch (type) {
		case entityTypes.CREATOR:
			error = await consumeCreator(record) || error;
			break;
		case entityTypes.EDITION:
			error = await consumeEdition(record) || error;
			break;
		case entityTypes.PUBLICATION:
			error = await consumePublication(record) || error;
			break;
		case entityTypes.PUBLISHER:
			error = await consumePublisher(record) || error;
			break;
		case entityTypes.WORK:
			error = await consumeWork(record) || error;
			break;
		default:
			error = importErrors.RECORD_ENTITY_NOT_FOUND;
			break;
	}
	return error;
}
