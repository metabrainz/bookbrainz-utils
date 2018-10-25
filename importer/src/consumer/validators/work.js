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


// @flow

import {get, validatePositiveInteger} from './base';
import {
	validateAliases, validateIdentifiers, validateNameSection
} from './common';
import _ from 'lodash';
import type {_IdentifierType} from './types';
import log from '../../helpers/logger';


export function validateWorkSectionType(value: ?any): boolean {
	return validatePositiveInteger(value);
}

export function validateWorkSectionLanguage(value: ?any): boolean {
	if (!value) {
		return true;
	}

	return validatePositiveInteger(get(value, 'value', null), true);
}

export function validateWorkSection(data: any): boolean {
	return (
		validateWorkSectionType(get(data, 'type', null)) &&
		validateWorkSectionLanguage(get(data, 'language', null))
	);
}

export function validateWork(
	validationObject: any,
	identifierTypes?: ?Array<_IdentifierType>
): boolean {
	let success = true;

	const {workerId, ...workValidationObject} = validationObject;
	if (_.isEmpty(workValidationObject)) {
		log.warning(`[CONSUMER::${workerId}] WORK Incoming validation object \
			\rempty`);
		return false;
	}

	// Cumulative error messages to be stored in err string
	let err = '';
	const aliasSection = get(workValidationObject, 'aliasSection', {});
	const identifierSection = get(
		workValidationObject, 'identifierSection', {}
	);
	const nameSection = get(workValidationObject, 'nameSection', {});
	const workSection = get(workValidationObject, 'workSection', {});

	log.info(`[CONSUMER::${workerId}] WORK - Calling validation functions.`);

	if (!validateAliases(aliasSection)) {
		err += 'WORK - Failed validate alias section failed. \n';
		success = false;
	}

	if (!validateIdentifiers(identifierSection, identifierTypes)) {
		err += 'WORK - Validate identifier section failed. \n';
		success = false;
	}

	if (!validateNameSection(nameSection)) {
		err += 'WORK - Validate name section failed. \n';
		success = false;
	}

	if (!validateWorkSection(workSection)) {
		err += 'WORK - Validate work section failed. \n';
		success = false;
	}

	if (!success) {
		log.error(`[CONSUMER::${workerId}]:: ${err} Record for reference:
			\r${JSON.stringify(validationObject, null, 4)}`);
	}
	return success;
}
