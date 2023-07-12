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
import {type CreatorSection, validateCreator} from './creator.ts';
import {type EditionSection, validateEdition} from './edition.ts';
import type {ParsedAlias, ParsedEntity} from '../../parser.ts';
import {type PublicationSection, validatePublication} from './publication.ts';
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
			case 'Creator':
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
			case 'Edition':
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
			case 'Publication':
				validationObject.publicationSection = {
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
	Creator: validateEntity(validateCreator, 'Creator'),
	Edition: validateEntity(validateEdition, 'Edition'),
	Publication: validateEntity(validatePublication, 'Publication'),
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
	creatorSection: CreatorSection;
	editionSection: EditionSection;
	publicationSection: PublicationSection;
	publisherSection: PublisherSection;
	workSection: WorkSection;
}>;
