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
	get, validateOptionalString, validatePositiveInteger, validateRequiredString
} from './base.ts';
import type {AliasWithDefaultT} from 'bookbrainz-data/lib/types/aliases.d.ts';
import type {IdentifierT} from 'bookbrainz-data/lib/types/identifiers.d.ts';
import _ from 'lodash';
import {isCollection} from 'immutable';
import log from '../../helpers/logger.ts';


export function validateMultiple(
	values: any[],
	validationFunction: (value: any, ...rest: any[]) => boolean,
	additionalArgs?: any
): boolean {
	// eslint-disable-next-line func-style
	let every = (object, predicate) => _.every(object, predicate);
	if (isCollection(values)) {
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

export function validateAliasDefault(value: any): boolean {
	return _.isBoolean(value);
}

export function validateAlias(value: any): boolean {
	if (_.isEmpty(value)) {
		log.warn('Empty alias value');
	}
	const name = get(value, 'name', null);
	const sortName = get(value, 'sortName', null);
	const language = get(value, 'languageId', null);
	const _default = get(value, 'default', null);

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

	if (!validateAliasDefault(_default)) {
		success = false;
		err += `Alias - Invalid default. ${_default}\n`;
	}

	if (!success) {
		log.warn(`Alias - Error \n${err} Alias for reference ${JSON.stringify(value, null, 4)}`);
		throw new Error(err);
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
	value: any, typeId: unknown, types?: Array<IdentifierType>
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
	typeId: any, types?: Array<IdentifierType>
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
	identifier: any, types?: Array<IdentifierType>
): boolean {
	const value = get(identifier, 'value');
	const type = get(identifier, 'typeId');

	return (
		validateIdentifierValue(value, type, types) &&
		validateIdentifierType(type, types)
	);
}

type ValidateIdentifiersFunc = (identifiers: any[], types?: Array<IdentifierType> | null | undefined) => boolean;
export const validateIdentifiers: ValidateIdentifiersFunc = _.partial(
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
		log.warn('Incoming validation object name section is empty');
		return !success;
	}

	const name = get(values, 'name', null);
	const sortName = get(values, 'sortName', null);
	const language = get(values, 'languageId', null);
	const disambiguation = get(values, 'disambiguation', null);
	let err = '';

	if (!validateNameSectionName(name)) {
		err += `Invalid name section name ${name} \n`;
		success = false;
	}

	if (!validateNameSectionSortName(sortName)) {
		err += `Invalid name section sort name ${sortName} \n`;
		success = false;
	}

	if (!validateNameSectionLanguage(language)) {
		err += `Invalid name section language ${language} \n`;
		success = false;
	}

	if (!validateNameSectionDisambiguation(disambiguation)) {
		err += `Invalid name section disambiguation ${JSON.stringify(disambiguation, null, 4)} \n`;
		success = false;
	}

	if (!success) {
		log.warn(`Invalid Name section - ${err}`);
		throw new Error(err);
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


export type NameSection = {
	name: string;
	sortName: string;
	languageId: number;
	default?: boolean;
	primary: boolean;
	disambiguation?: string;
};

export type AliasSection = Record<string, AliasWithDefaultT>;

export type IdentifierSection = Record<string, IdentifierT>;

/** Incomplete area type definition for validation functions. */
export type AreaStub = {
	id: number;
	[x: string]: any;
};

/** Incomplete language type definition for validation functions. */
export type LanguageStub = {
	value: number;
	[x: string]: any;
};

/** Incomplete entity type definition for validation functions. */
export type EntityStub = {
	id: string;
	[x: string]: any;
};
