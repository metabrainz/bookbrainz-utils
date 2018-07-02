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

import {
	get, validateOptionalString, validatePositiveInteger, validateRequiredString
} from './base';
import {Iterable} from 'immutable';
import _ from 'lodash';
import log from '../../helpers/logger';


export function validateMultiple(
	values: any[],
	validationFunction: (value: any, ...rest: any[]) => boolean,
	additionalArgs?: any
): boolean {
	// eslint-disable-next-line func-style
	let every = (object, predicate) => _.every(object, predicate);
	if (Iterable.isIterable(values)) {
		every = (object, predicate) => object.every(predicate);
	}
	else if (!_.isObject(values)) {
		return false;
	}

	return every(values, (value) =>
		validationFunction(value, additionalArgs));
}

export function validateAliasName(value: any): boolean {
	return validateRequiredString(value);
}

export function validateAliasSortName(value: any): boolean {
	return validateRequiredString(value);
}

export function validateAliasLanguage(value: any): boolean {
	return validatePositiveInteger(value, true);
}

export function validateAliasPrimary(value: any): boolean {
	return _.isBoolean(value);
}

export function validateAlias(value: any): boolean {
	if (_.isEmpty(value)) {
		log.warn('Empty alias value');
	}
	const name = get(value, 'name', null);
	const sortName = get(value, 'sortName', null);
	const language = get(value, 'language', null);
	const primary = get(value, 'primary', null);

	let success = true;
	let err = '';
	if (!validateAliasName(name)) {
		success = false;
		err += `Alias - Invalid name. ${name}\n`;
	}

	if (!validateAliasSortName(sortName)) {
		success = false;
		err += `Alias - Invalid sort name. ${name}\n`;
	}

	if (!validateAliasLanguage(language)) {
		success = false;
		err += `Alias - Invalid language. ${language}\n`;
	}

	if (!validateAliasPrimary(primary)) {
		success = false;
		err += `Alias - Invalid primary. ${primary}\n`;
	}

	if (!success) {
		log.warning(`Alias - Error \n${err}\
		\r Alias for reference ${JSON.stringify(value, null, 4)}`);
	}

	return success;
}

export const validateAliases = _.partial(
	validateMultiple, _.partial.placeholder, validateAlias
);

export type IdentifierType = {
	id: number,
	label: string,
	validationRegex: string
};

export function validateIdentifierValue(
	value: any, typeId: mixed, types?: ?Array<IdentifierType>
): boolean {
	if (!validateRequiredString(value)) {
		return false;
	}

	if (!types) {
		return true;
	}

	const selectedType = _.find(types, (type) => type.id === typeId);

	if (selectedType) {
		return new RegExp(selectedType.validationRegex).test(value);
	}

	return false;
}

export function validateIdentifierType(
	typeId: any, types?: ?Array<IdentifierType>
): boolean {
	if (!validatePositiveInteger(typeId, true)) {
		return false;
	}

	if (!types) {
		return true;
	}

	const selectedType = _.find(types, (type) => type.id === typeId);

	return Boolean(selectedType);
}

export function validateIdentifier(
	identifier: any, types?: ?Array<IdentifierType>
): boolean {
	const value = get(identifier, 'value');
	const type = get(identifier, 'type');

	return (
		validateIdentifierValue(value, type, types) &&
		validateIdentifierType(type, types)
	);
}

export const validateIdentifiers = _.partial(
	validateMultiple, _.partial.placeholder,
	validateIdentifier, _.partial.placeholder
);

export function validateNameSectionName(value: any): boolean {
	return validateRequiredString(value);
}

export function validateNameSectionSortName(value: any): boolean {
	return validateRequiredString(value);
}

export function validateNameSectionLanguage(value: any): boolean {
	return validatePositiveInteger(value, true);
}

export function validateNameSectionDisambiguation(value: any): boolean {
	return validateOptionalString(value);
}

export function validateNameSection(
	values: any
): boolean {
	let success = true;

	if (_.isEmpty(values)) {
		log.warning('Incoming validation object name section is empty');
		return !success;
	}

	const name = get(values, 'name', null);
	const sortName = get(values, 'sortName', null);
	const language = get(values, 'language', null);
	const disambiguation = get(values, 'disambiguation', null);

	if (!validateNameSectionName(name)) {
		log.error(`Name section - Invalid name section name ${name}`);
		success = false;
	}

	if (!validateNameSectionSortName(sortName)) {
		log.error(`Name section - Invalid name section sort name ${sortName}`);
		success = false;
	}

	if (!validateNameSectionLanguage(language)) {
		log.error(`Name section - Invalid name section language ${language}`);
		success = false;
	}

	if (!validateNameSectionDisambiguation(disambiguation)) {
		log.error(`Name section - Invalid name section disambiguation\
		\r ${JSON.stringify(disambiguation, null, 4)}`);
		success = false;
	}

	return success;
}

export function validateSubmissionSectionNote(value: any): boolean {
	return validateRequiredString(value);
}

export function validateSubmissionSection(
	data: any
): boolean {
	return (
		validateSubmissionSectionNote(get(data, 'note', null))
	);
}
