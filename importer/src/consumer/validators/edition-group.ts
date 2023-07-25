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


export function validateEditionGroupSectionType(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validateEditionGroupSection(data: any): boolean {
	return validateEditionGroupSectionType(get(data, 'type', null));
}

export function validateEditionGroup(
	editionGroupValidationObject: any, identifierTypes?: Array<_IdentifierType>
): boolean {
	let success = true;

	if (_.isEmpty(editionGroupValidationObject)) {
		log.warn('[CONSUMER] EDITION GROUP Incoming validation object empty');
		return false;
	}

	// Cumulative error messages to be stored in err string
	let err = '';
	const aliasSection = get(editionGroupValidationObject, 'aliasSection', {});
	const identifierSection = get(
		editionGroupValidationObject, 'identifierSection', {}
	);
	const nameSection = get(editionGroupValidationObject, 'nameSection', {});
	const editionGroupSection = get(
		editionGroupValidationObject,
		'editionGroupSection',
		{}
	);

	log.info('[CONSUMER] EDITION GROUP - Calling validation functions.');

	if (!validateAliases(aliasSection)) {
		err += 'EDITION GROUP - Failed validate alias section. \n';
		success = false;
	}

	if (!validateIdentifiers(identifierSection, identifierTypes)) {
		err += 'EDITION GROUP - Validate identifier section. \n';
		success = false;
	}

	if (!validateNameSection(nameSection)) {
		err += 'EDITION GROUP - Validate name section. \n';
		success = false;
	}

	if (!validateEditionGroupSection(editionGroupSection)) {
		err += 'EDITION GROUP - Validate edition group section. \n';
		success = false;
	}

	if (!success) {
		log.error(`[CONSUMER]:: ${err} Record for reference: ${JSON.stringify(editionGroupValidationObject, null, 4)}`);
	}
	return success;
}


export type EditionGroupSection = {
	type?: number;
};
