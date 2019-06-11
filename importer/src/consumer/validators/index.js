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
import {entityTypes} from '../../helpers/utils';
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

function getDefaultAlias(aliasList) {
	let primaryAlias = null;
	if (aliasList && _.isArray(aliasList)) {
		for (const i in aliasList) {
			if (aliasList[i].default) {
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
	const defaultAlias = getDefaultAlias(record.alias);

	const nameSection = {
		disambiguation: record.disambiguation,
		...defaultAlias
	};

	return nameSection;
}

function validateEntity(validationFunction, entityType) {
	return function validate(validationData) {
		if (_.isEmpty(validationData)) {
			return false;
		}
		// Construct generic validation object from data set for validation
		const validationObject = {
			aliasSection: getAliasSection(validationData),
			identifierSection: getIdentifierSection(validationData),
			nameSection: getNameSection(validationData),
			workerId: validationData.workerId
		};

		// Add entity specific validation data
		switch (entityType) {
			case entityTypes.CREATOR:
				validationObject.creatorSection = {
					beginArea: validationData.beginArea,
					beginDate: validationData.beginDate,
					endArea: validationData.endArea,
					endDate: validationData.endDate,
					ended: validationData.ended,
					gender: validationData.gender,
					type: validationData.type
				};
				break;
			case entityTypes.EDITION:
				validationObject.editionSection = {
					depth: validationData.depth,
					format: validationData.format,
					height: validationData.height,
					languages: validationData.languages,
					pages: validationData.pages,
					publication: validationData.publication,
					publisher: validationData.publisher,
					releaseDate: validationData.releaseDate,
					status: validationData.status,
					weight: validationData.weight,
					width: validationData.width
				};
				break;
			case entityTypes.PUBLICATION:
				validationObject.publicationSection = {
					type: validationData.type
				};
				break;
			case entityTypes.PUBLISHER:
				validationObject.publisherSection = {
					area: validationData.area,
					beginDate: validationData.beginDate,
					endDate: validationData.endDate,
					ended: validationData.ended,
					type: validationData.type
				};
				break;
			case entityTypes.WORK:
				validationObject.workSection = {
					language: validationData.language,
					type: validationData.type
				};
				break;
			default:
				break;
		}

		return validationFunction(validationObject);
	};
}

const validate = {
	[entityTypes.CREATOR]: validateEntity(validateCreator, entityTypes.CREATOR),
	[entityTypes.EDITION]: validateEntity(validateEdition, entityTypes.EDITION),
	[entityTypes.PUBLICATION]: validateEntity(validatePublication, entityTypes.PUBLICATION),
	[entityTypes.PUBLISHER]: validateEntity(validatePublisher, entityTypes.PUBLISHER),
	[entityTypes.WORK]: validateEntity(validateWork, entityTypes.WORK)
};

export default validate;
