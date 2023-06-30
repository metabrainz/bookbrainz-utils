/*
 * Adapted from bookbrainz-site.
 * Copyright (C) 2017  Ben Ockmore
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


import {get, validatePositiveInteger} from './base.ts';
import {
	validateAliases, validateIdentifiers, validateNameSection
} from './common.ts';
import _ from 'lodash';
import type {_IdentifierType} from './types.ts';
import log from '../../helpers/logger.ts';


export function validatePublicationSectionType(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validatePublicationSection(data: any): boolean {
	return validatePublicationSectionType(get(data, 'type', null));
}

export function validatePublication(
	validationObject: any, identifierTypes?: Array<_IdentifierType>
): boolean {
	let success = true;

	const {workerId, ...publicationValidationObject} = validationObject;
	if (_.isEmpty(publicationValidationObject)) {
		log.warning(`[CONSUMER::${workerId}] PUBLICATION Incoming validation object empty`);
		return false;
	}

	// Cumulative error messages to be stored in err string
	let err = '';
	const aliasSection = get(publicationValidationObject, 'aliasSection', {});
	const identifierSection = get(
		publicationValidationObject, 'identifierSection', {}
	);
	const nameSection = get(publicationValidationObject, 'nameSection', {});
	const publicationSection = get(
		publicationValidationObject,
		'publicationSection',
		{}
	);

	log.info(`[CONSUMER::${workerId}] PUBLICATION - Calling validation functions.`);

	if (!validateAliases(aliasSection)) {
		err += 'PUBLICATION - Failed validate alias section. \n';
		success = false;
	}

	if (!validateIdentifiers(identifierSection, identifierTypes)) {
		err += 'PUBLICATION - Validate identifier section. \n';
		success = false;
	}

	if (!validateNameSection(nameSection)) {
		err += 'PUBLICATION - Validate name section. \n';
		success = false;
	}

	if (!validatePublicationSection(publicationSection)) {
		err += 'PUBLICATION - Validate publication section. \n';
		success = false;
	}

	if (!success) {
		log.error(`[CONSUMER::${workerId}]:: ${err} Record for reference:
			\r${JSON.stringify(validationObject, null, 4)}`);
	}
	return success;
}
