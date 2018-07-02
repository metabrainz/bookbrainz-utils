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


import _ from 'lodash';
import {sortName} from '../../helpers/utils';
import {validateCreator} from './creator';
import {validateEdition} from './edition';
import {validatePublication} from './publication';
import {validatePublisher} from './publisher';
import {validateWork} from './work';


function getAliasSection(record) {
	const aliasSection = {};
	let index = 0;
	if (record.alias) {
		record.alias.forEach(element => {
			if (!element.primary) {
				aliasSection[`n${index++}`] = element;
			}
		});
	}

	return aliasSection;
}

function getPrimaryAlias(aliasList) {
	let primaryAlias = null;
	if (aliasList && _.isArray(aliasList)) {
		for (let i in aliasList) {
			if (aliasList[i].primary) {
				primaryAlias = aliasList[i];
				break;
			}
		}
	}

	return primaryAlias;
}

function getIdentifierSection(record) {
	const identifierSection = {};
	let index = 0;
	if (record.identifiers) {
		record.identifiers.forEach(element => {
			identifierSection[`n${index++}`] = element;
		});
	}

	return identifierSection;
}

function getNameSection(record) {
	const primaryAlias = getPrimaryAlias(record.alias);

	const nameSection = {
		disambiguation: record.disambiguation,
		...primaryAlias
	};

	return nameSection;
}

function getValidationObject(record) {
	return {
		aliasSection: getAliasSection(record),
		identifierSection: getIdentifierSection(record),
		nameSection: getNameSection(record)
	};
}

function validateEntity(validationFunction) {
	return function validate(record) {
		const validationObject = getValidationObject(record);
		return validationFunction(validationObject);
	};
}

const validate = {
	creator: validateEntity(validateCreator),
	edition: validateEntity(validateEdition),
	publication: validateEntity(validatePublication),
	publisher: validatePublisher(validatePublisher),
	work: validateEntity(validateWork)
};

export default validate;
