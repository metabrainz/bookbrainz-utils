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


import {get, validateDate, validatePositiveInteger} from './base.js';
import {
	validateAliases, validateIdentifiers, validateNameSection
} from './common.js';
import _ from 'lodash';
import type {_IdentifierType} from './types.js';
import log from '../../helpers/logger.js';


export function validateCreatorSectionBeginArea(value: any): boolean {
	if (!value) {
		return true;
	}

	return validatePositiveInteger(get(value, 'id', null), true);
}

export function validateCreatorSectionBeginDate(value: any): boolean {
	return validateDate(value);
}

export function validateCreatorSectionEndArea(value: any): boolean {
	if (!value) {
		return true;
	}

	return validatePositiveInteger(get(value, 'id', null), true);
}

export function validateCreatorSectionEndDate(value: any): boolean {
	return validateDate(value);
}

export function validateCreatorSectionEnded(value: any): boolean {
	return _.isNull(value) || _.isBoolean(value);
}

export function validateCreatorSectionType(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validateCreatorSectionGender(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validateCreatorSection(data: any): boolean {
	return (
		validateCreatorSectionBeginArea(get(data, 'beginArea', null)) &&
		validateCreatorSectionBeginDate(get(data, 'beginDate', null)) &&
		validateCreatorSectionEndArea(get(data, 'endArea', null)) &&
		validateCreatorSectionEndDate(get(data, 'endDate', null)) &&
		validateCreatorSectionEnded(get(data, 'ended', null)) &&
		validateCreatorSectionType(get(data, 'gender', null)) &&
		validateCreatorSectionType(get(data, 'type', null))
	);
}

export function validateCreator(
	validationObject: any, identifierTypes?: Array<_IdentifierType>
): boolean {
	let success = true;

	const {workerId, ...creatorValidationObject} = validationObject;
	if (_.isEmpty(creatorValidationObject)) {
		log.warning(`[CONSUMER::${workerId}] CREATOR Incoming validation object empty`);
		return false;
	}

	// Cumulative error messages to be stored in err string
	let err = '';
	const aliasSection = get(creatorValidationObject, 'aliasSection', {});
	const identifierSection = get(
		creatorValidationObject, 'identifierSection', {}
	);
	const nameSection = get(creatorValidationObject, 'nameSection', {});
	const creatorSection = get(
		creatorValidationObject,
		'creatorSection',
		{}
	);

	log.info(`[CONSUMER::${workerId}] CREATOR - Calling validation functions.`);

	if (!validateAliases(aliasSection)) {
		err += 'CREATOR - Validate alias section failed. \n';
		success = false;
	}

	if (!validateIdentifiers(identifierSection, identifierTypes)) {
		err += 'CREATOR - Validate identifier section failed. \n';
		success = false;
	}

	if (!validateNameSection(nameSection)) {
		err += 'CREATOR - Validate name section failed. \n';
		success = false;
	}

	if (!validateCreatorSection(creatorSection)) {
		err += 'CREATOR - Validate creator section failed. \n';
		success = false;
	}

	if (!success) {
		log.error(`[CONSUMER::${workerId}]:: ${err} Record for reference:
			\r${JSON.stringify(validationObject, null, 4)}`);
	}
	return success;
}
