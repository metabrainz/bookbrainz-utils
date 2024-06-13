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
import type {
	ParsedAuthor, ParsedEdition, ParsedEditionGroup, ParsedEntity, ParsedPublisher, ParsedWork
} from 'bookbrainz-data/lib/types/parser.d.ts';
import {type PublisherSection, validatePublisher} from './publisher.ts';
import {type WorkSection, validateWork} from './work.ts';
import type {AliasWithDefaultT} from 'bookbrainz-data/lib/types/aliases.d.ts';
import type {EntityTypeString} from 'bookbrainz-data/lib/types/entity.d.ts';
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

function getDefaultAlias(aliasList: AliasWithDefaultT[]): AliasWithDefaultT {
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

function idToEntityStub<T>(id: T) {
	return id ? {id} : null;
}

function validateEntity(validationFunction, entityType: EntityTypeString) {
	return function validate(validationData: ParsedEntity) {
		if (_.isEmpty(validationData)) {
			return false;
		}
		// Construct generic validation object from data set for validation
		const validationObject: EntityValidationSections = {
			aliasSection: getAliasSection(validationData),
			identifierSection: getIdentifierSection(validationData),
			nameSection: getNameSection(validationData)
		};

		// Add entity specific validation data
		switch (entityType) {
			case 'Author':
				/* eslint-disable no-case-declarations */
				// TODO: The code would be much cleaner if we could add the `entityType` property back to `ParsedEntity`
				// for type inference after the conflicting property of `ParsedSeries` has been renamed.
				const authorData = validationData as ParsedAuthor;
				validationObject.authorSection = {
					beginArea: idToEntityStub(authorData.beginAreaId),
					beginDate: authorData.beginDate,
					endArea: idToEntityStub(authorData.endAreaId),
					endDate: authorData.endDate,
					ended: authorData.ended,
					gender: authorData.genderId,
					type: authorData.typeId
				};
				break;
			case 'Edition':
				const editionData = validationData as ParsedEdition;
				validationObject.editionSection = {
					depth: editionData.depth,
					editionGroup: idToEntityStub(editionData.editionGroupBbid),
					format: editionData.formatId,
					height: editionData.height,
					languages: editionData.languages.map(({id}) => ({value: id})),
					pages: editionData.pages,
					// TODO: publisher: idToEntityStub(editionData.publisher),
					// TODO: release events (date and country) should not be mapped to just a date
					// releaseDate: editionData.releaseDate,
					status: editionData.statusId,
					weight: editionData.weight,
					width: editionData.width
				};
				break;
			case 'EditionGroup':
				const editionGroupData = validationData as ParsedEditionGroup;
				validationObject.editionGroupSection = {
					type: editionGroupData.typeId
				};
				break;
			case 'Publisher':
				const publisherData = validationData as ParsedPublisher;
				validationObject.publisherSection = {
					area: idToEntityStub(publisherData.areaId),
					beginDate: publisherData.beginDate,
					endDate: publisherData.endDate,
					ended: publisherData.ended,
					type: publisherData.typeId
				};
				break;
			case 'Work':
				const workData = validationData as ParsedWork;
				validationObject.workSection = {
					// TODO: language: workData.language,
					type: workData.typeId
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
};

type EntityValidationSections = CommonValidationSections & Partial<{
	authorSection: AuthorSection;
	editionSection: EditionSection;
	editionGroupSection: EditionGroupSection;
	publisherSection: PublisherSection;
	workSection: WorkSection;
}>;
