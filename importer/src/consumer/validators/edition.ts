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
	type EntityStub, type LanguageStub,
	validateAliases, validateIdentifiers, validateNameSection
} from './common.ts';
import {get, validateDate, validatePositiveInteger, validateUUID} from './base.ts';
import _ from 'lodash';
import type {_IdentifierType} from './types.ts';
import {isCollection} from 'immutable';
import log from '../../helpers/logger.ts';


export function validateEditionSectionDepth(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validateEditionSectionFormat(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validateEditionSectionHeight(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validateEditionSectionLanguage(value: any): boolean {
	return validatePositiveInteger(get(value, 'value', null), true);
}

export function validateEditionSectionLanguages(values: any): boolean {
	if (!values) {
		return true;
	}

	// eslint-disable-next-line func-style
	let every = (object, predicate) => _.every(object, predicate);
	if (isCollection(values)) {
		every = (object, predicate) => object.every(predicate);
	}
	else if (!_.isObject(values)) {
		return false;
	}

	return every(values, (value) => validateEditionSectionLanguage(value));
}

export function validateEditionSectionPages(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validateEditionSectionPublication(value: any): boolean {
	return validateUUID(get(value, 'id', null), true);
}

export function validateEditionSectionPublisher(value: any): boolean {
	if (!value) {
		return true;
	}

	return validateUUID(get(value, 'id', null), true);
}

export function validateEditionSectionReleaseDate(value: any): boolean {
	return validateDate(value);
}

export function validateEditionSectionStatus(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validateEditionSectionWeight(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validateEditionSectionWidth(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validateEditionSection(data: any): boolean {
	return (
		validateEditionSectionDepth(get(data, 'depth', null)) &&
		validateEditionSectionFormat(get(data, 'format', null)) &&
		validateEditionSectionHeight(get(data, 'height', null)) &&
		validateEditionSectionLanguages(get(data, 'languages', null)) &&
		validateEditionSectionPages(get(data, 'pages', null)) &&
		validateEditionSectionPublication(get(data, 'publication', null)) &&
		validateEditionSectionPublisher(get(data, 'publisher', null)) &&
		validateEditionSectionReleaseDate(get(data, 'releaseDate', null)) &&
		validateEditionSectionStatus(get(data, 'status', null)) &&
		validateEditionSectionWeight(get(data, 'weight', null)) &&
		validateEditionSectionWidth(get(data, 'width', null))
	);
}

export function validateEdition(
	validationObject: any, identifierTypes?: Array<_IdentifierType>
): boolean {
	let success = true;

	const {workerId, ...editionValidationObject} = validationObject;
	if (_.isEmpty(editionValidationObject)) {
		log.warn(`[CONSUMER::${workerId}] Edition Incoming validation object empty`);
		return false;
	}

	// Cumulative error messages to be stored in err string
	let err = '';
	const aliasSection = get(editionValidationObject, 'aliasSection', {});
	const identifierSection = get(
		editionValidationObject, 'identifierSection', {}
	);
	const nameSection = get(editionValidationObject, 'nameSection', {});
	const editionSection = get(editionValidationObject, 'editionSection', {});

	log.info(`[CONSUMER::${workerId}] EDITION - Calling validation functions.`);

	if (!validateAliases(aliasSection)) {
		err += 'EDITION - Failed validate alias section failed. \n';
		success = false;
	}

	if (!validateIdentifiers(identifierSection, identifierTypes)) {
		err += 'EDITION - Validate identifier section failed. \n';
		success = false;
	}

	if (!validateNameSection(nameSection)) {
		err += 'EDITION - Validate name section failed. \n';
		success = false;
	}

	if (!validateEditionSection(editionSection)) {
		err += 'EDITION - Validate edition section failed. \n';
		success = false;
	}

	if (!success) {
		log.error(`[CONSUMER::${workerId}]:: ${err} Record for reference:
			\r${JSON.stringify(validationObject, null, 4)}`);
	}
	return success;
}


export type EditionSection = {
	depth?: number;
	format?: number;
	height?: number;
	languages?: LanguageStub[];
	pages?: number;
	publication: EntityStub;
	publisher?: EntityStub;
	releaseDate?: string;
	status?: number;
	weight?: number;
	width?: number;
};
