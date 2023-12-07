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


import {
	type AreaStub,
	validateAliases, validateIdentifiers, validateNameSection
} from './common.ts';
import {get, validateDate, validatePositiveInteger} from './base.ts';
import _ from 'lodash';
import type {_IdentifierType} from './types.ts';
import log from '../../helpers/logger.ts';


export function validateAuthorSectionBeginArea(value: any): boolean {
	if (!value) {
		return true;
	}

	return validatePositiveInteger(get(value, 'id', null), true);
}

export function validateAuthorSectionBeginDate(value: any): boolean {
	return validateDate(value);
}

export function validateAuthorSectionEndArea(value: any): boolean {
	if (!value) {
		return true;
	}

	return validatePositiveInteger(get(value, 'id', null), true);
}

export function validateAuthorSectionEndDate(value: any): boolean {
	return validateDate(value);
}

export function validateAuthorSectionEnded(value: any): boolean {
	return _.isNull(value) || _.isBoolean(value);
}

export function validateAuthorSectionType(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validateAuthorSectionGender(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validateAuthorSection(data: any): boolean {
	return (
		validateAuthorSectionBeginArea(get(data, 'beginArea', null)) &&
		validateAuthorSectionBeginDate(get(data, 'beginDate', null)) &&
		validateAuthorSectionEndArea(get(data, 'endArea', null)) &&
		validateAuthorSectionEndDate(get(data, 'endDate', null)) &&
		validateAuthorSectionEnded(get(data, 'ended', null)) &&
		validateAuthorSectionType(get(data, 'gender', null)) &&
		validateAuthorSectionType(get(data, 'type', null))
	);
}

export function validateAuthor(
	authorValidationObject: any, identifierTypes?: Array<_IdentifierType>
): boolean {
	let success = true;

	if (_.isEmpty(authorValidationObject)) {
		log.warn('[CONSUMER] AUTHOR Incoming validation object empty');
		return false;
	}

	// Cumulative error messages to be stored in err string
	let err = '';
	const aliasSection = get(authorValidationObject, 'aliasSection', {});
	const identifierSection = get(
		authorValidationObject, 'identifierSection', {}
	);
	const nameSection = get(authorValidationObject, 'nameSection', {});
	const authorSection = get(
		authorValidationObject,
		'authorSection',
		{}
	);

	log.debug('[CONSUMER] AUTHOR - Calling validation functions.');

	if (!validateAliases(aliasSection)) {
		err += 'AUTHOR - Validate alias section failed. \n';
		success = false;
	}

	if (!validateIdentifiers(identifierSection, identifierTypes)) {
		err += 'AUTHOR - Validate identifier section failed. \n';
		success = false;
	}

	if (!validateNameSection(nameSection)) {
		err += 'AUTHOR - Validate name section failed. \n';
		success = false;
	}

	if (!validateAuthorSection(authorSection)) {
		err += 'AUTHOR - Validate author section failed. \n';
		success = false;
	}

	if (!success) {
		log.error(`[CONSUMER]:: ${err} Record for reference: ${JSON.stringify(authorValidationObject, null, 4)}`);
	}
	return success;
}


export type AuthorSection = Partial<{
	beginArea: AreaStub;
	beginDate: string;
	endArea: AreaStub;
	endDate: string;
	ended: boolean;
	gender: number;
	type: number;
}>;
