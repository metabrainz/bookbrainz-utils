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


import type {AliasSection, IdentifierSection, NameSection} from './common.ts';
import {type AuthorSection, validateAuthor} from './author.ts';
import {type EditionGroupSection, validateEditionGroup} from './edition-group.ts';
import {type EditionSection, validateEdition} from './edition.ts';
import type {ParsedAlias, ParsedEntity} from '../../parser.ts';
import {type PublisherSection, validatePublisher} from './publisher.ts';
import {type WorkSection, validateWork} from './work.ts';
import {type EntityTypeString} from 'bookbrainz-data/lib/types/entity.js';
import _ from 'lodash';


function getAliasSection(record: ParsedEntity): AliasSection {
	const aliasSection: AliasSection = {};
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

function getDefaultAlias(aliasList: ParsedAlias[]): ParsedAlias {
	return aliasList?.find((alias) => alias.default);
}

function getIdentifierSection(record: ParsedEntity): IdentifierSection {
	const identifierSection: IdentifierSection = {};
	let index = 0;
	if (record.identifiers) {
		record.identifiers.forEach(element => {
			identifierSection[`n${index++}`] = element;
		});
	}

	return identifierSection;
}

function getNameSection(record: ParsedEntity): NameSection {
	const defaultAlias = getDefaultAlias(record.alias);

	const nameSection = {
		disambiguation: record.disambiguation,
		...defaultAlias
	};

	return nameSection;
}

function validateEntity(validationFunction, entityType: EntityTypeString) {
	return function validate(validationData) {
		if (_.isEmpty(validationData)) {
			return false;
		}
		// Construct generic validation object from data set for validation
		const validationObject: EntityValidationSections = {
			aliasSection: getAliasSection(validationData),
			identifierSection: getIdentifierSection(validationData),
			nameSection: getNameSection(validationData),
			workerId: validationData.workerId
		};

		// Add entity specific validation data
		switch (entityType) {
			case 'Author':
				validationObject.authorSection = {
					beginArea: validationData.beginArea,
					beginDate: validationData.beginDate,
					endArea: validationData.endArea,
					endDate: validationData.endDate,
					ended: validationData.ended,
					gender: validationData.gender,
					type: validationData.type
				};
				break;
			case 'Edition':
				validationObject.editionSection = {
					depth: validationData.depth,
					editionGroup: validationData.editionGroup,
					format: validationData.format,
					height: validationData.height,
					languages: validationData.languages,
					pages: validationData.pages,
					publisher: validationData.publisher,
					releaseDate: validationData.releaseDate,
					status: validationData.status,
					weight: validationData.weight,
					width: validationData.width
				};
				break;
			case 'EditionGroup':
				validationObject.editionGroupSection = {
					type: validationData.type
				};
				break;
			case 'Publisher':
				validationObject.publisherSection = {
					area: validationData.area,
					beginDate: validationData.beginDate,
					endDate: validationData.endDate,
					ended: validationData.ended,
					type: validationData.type
				};
				break;
			case 'Work':
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

const validate: Record<EntityTypeString, ReturnType<typeof validateEntity>> = {
	Author: validateEntity(validateAuthor, 'Author'),
	Edition: validateEntity(validateEdition, 'Edition'),
	EditionGroup: validateEntity(validateEditionGroup, 'EditionGroup'),
	Publisher: validateEntity(validatePublisher, 'Publisher'),
	Work: validateEntity(validateWork, 'Work')
};

export default validate;


type CommonValidationSections = {
	aliasSection: AliasSection;
	identifierSection: IdentifierSection;
	nameSection: NameSection;
	workerId: number;
};

type EntityValidationSections = CommonValidationSections & Partial<{
	authorSection: AuthorSection;
	editionSection: EditionSection;
	editionGroupSection: EditionGroupSection;
	publisherSection: PublisherSection;
	workSection: WorkSection;
}>;
