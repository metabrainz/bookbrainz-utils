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


export function validatePublisherSectionArea(value: any): boolean {
	if (!value) {
		return true;
	}

	return validatePositiveInteger(get(value, 'id', null), true);
}

export function validatePublisherSectionBeginDate(value: any): boolean {
	return validateDate(value);
}

export function validatePublisherSectionEndDate(value: any): boolean {
	return validateDate(value);
}

export function validatePublisherSectionEnded(value: any): boolean {
	return _.isNull(value) || _.isBoolean(value);
}

export function validatePublisherSectionType(value: any): boolean {
	return validatePositiveInteger(value);
}


export function validatePublisherSection(data: any): boolean {
	return (
		validatePublisherSectionArea(get(data, 'area', null)) &&
		validatePublisherSectionBeginDate(get(data, 'beginDate', null)) &&
		validatePublisherSectionEndDate(get(data, 'endDate', null)) &&
		validatePublisherSectionEnded(get(data, 'ended', null)) &&
		validatePublisherSectionType(get(data, 'type', null))
	);
}

export function validatePublisher(
	publisherValidationObject: any,
	identifierTypes?: Array<_IdentifierType>
): boolean {
	let success = true;

	if (_.isEmpty(publisherValidationObject)) {
		log.warn('[CONSUMER] PUBLISHER Incoming validation object empty');
		return false;
	}

	// Cumulative error messages to be stored in err string
	let err = '';
	const aliasSection = get(publisherValidationObject, 'aliasSection', {});
	const identifierSection = get(
		publisherValidationObject, 'identifierSection', {}
	);
	const nameSection = get(publisherValidationObject, 'nameSection', {});
	const publisherSection = get(
		publisherValidationObject,
		'publisherSection',
		{}
	);

	log.debug('[CONSUMER] PUBLISHER - Calling validation functions.');

	if (!validateAliases(aliasSection)) {
		err += 'PUBLISHER - Failed validate alias section failed. \n';
		success = false;
	}

	if (!validateIdentifiers(identifierSection, identifierTypes)) {
		err += 'PUBLISHER - Validate identifier section failed. \n';
		success = false;
	}

	if (!validateNameSection(nameSection)) {
		err += 'PUBLISHER - Validate name section failed. \n';
		success = false;
	}

	if (!validatePublisherSection(publisherSection)) {
		err += 'PUBLISHER - Validate publisher section failed. \n';
		success = false;
	}

	if (!success) {
		log.error(`[CONSUMER]:: ${err} Record for reference: ${JSON.stringify(publisherValidationObject, null, 4)}`);
	}
	return success;
}


export type PublisherSection = Partial<{
	area: AreaStub;
	beginDate: string;
	endDate: string;
	ended: boolean;
	type: number;
}>;
