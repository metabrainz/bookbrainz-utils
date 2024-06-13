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


import type {ParsedAuthor, ParsedEntity, ParsedWork} from 'bookbrainz-data/lib/types/parser.d.ts';
import {francMinMapping, identifiers, mapLanguage} from '../../helpers/mapping.ts';
import {isNotDefined, sortName} from '../../helpers/utils.ts';
import type {EntityTypeString} from 'bookbrainz-data/lib/types/entity.d.ts';
import _ from 'lodash';
import {franc} from 'franc-min';
import lande from 'lande';
import log from '../../helpers/logger.ts';


/** OpenLibrary entity types which are handled by the parser. */
export const OL_ENTITY_TYPES = [
	'author',
	'edition',
	'work'
] as const;

export type OLEntityType = typeof OL_ENTITY_TYPES[number];


/** Maps a supported OpenLibrary entity type to a BookBrainz entity type. */
export function mapEntityType(sourceType: OLEntityType): EntityTypeString | null {
	switch (sourceType) {
		case 'author': return 'Author';
		case 'edition': return 'Edition';
		case 'work': return 'Work';
		default: return null;
	}
}

function detectLanguage(name: string, confidenceMinimum = 0.7): number {
	// lande already sorts the results by decreasing confidence
	const topLanguages = lande(name)
		.filter(([_lang, confidence]) => confidence > 0.1)
		.slice(0, 5);
	const [topLanguage, confidence] = topLanguages[0];

	const topLanguagesString = topLanguages.map(
		([lang, confidence]) => `${francMinMapping[lang] ?? lang} (${confidence.toFixed(2)})`
	).join(', ');
	log.debug(`Detected top languages of '${name}': ${topLanguagesString}`);

	// Also log the result with franc for comparison, TODO: drop later
	const francLanguage = franc(name);
	log.debug(`Detected language (franc): ${francMinMapping[francLanguage] ?? francLanguage}`);

	// In case we have no idea about the (mandatory) language, better fallback to [Multiple languages]
	return mapLanguage(confidence > confidenceMinimum ? topLanguage : 'mul');
}

function processWork(json: any) {
	if (isNotDefined(json)) {
		return null;
	}

	// Base skeleton, remaining keys are added as and when they are extracted
	const work: ParsedWork = {
		alias: [],
		identifiers: [],
		metadata: {
			links: [],
			relationships: []
		},
		source: 'OpenLibrary'
	};

	// Set up aliases
	// The first alias (in the logical flow) is made to be default alias
	let defaultAlias = true;
	if (!isNotDefined(json.title)) {
		const name = json.title;
		const lang = detectLanguage(name);

		work.alias.push({
			default: defaultAlias,
			languageId: lang,
			name,
			primary: true,
			sortName: sortName(name)
		});
		defaultAlias = false;
	}
	if (!isNotDefined(json.subtitle)) {
		const name = json.subtitle;
		const lang = detectLanguage(name);

		work.alias.push({
			default: defaultAlias,
			languageId: lang,
			name,
			primary: false,
			sortName: sortName(name)
		});
		defaultAlias = false;
	}


	// Last Edited at source
	if (!isNotDefined(_.get(json, 'last_modified.value'))) {
		work.lastEdited = json.last_modified.value;
	}

	if (!isNotDefined(json.key)) {
		const openLibraryWorkId = json.key.split('/')[2];
		work.identifiers.push({
			typeId: identifiers.openLibraryWorkId,
			value: openLibraryWorkId
		});
		work.originId = openLibraryWorkId;
	}

	if (!isNotDefined(json.authors) && (json.authors instanceof Array)) {
		json.authors.forEach((authorObj) => {
			if (!isNotDefined(authorObj && _.get(authorObj, 'author.key'))) {
				work.metadata.relationships.push({
					type: 'authoredBy',
					value: authorObj.author.key.split('/')[2]
				});
			}
		});
	}

	if (!isNotDefined(json.description)) {
		work.annotation = json.description.value;
	}

	if (!isNotDefined(json.links) && (json.links instanceof Array)) {
		json.links.forEach(link => {
			if (!isNotDefined(link.title && link.url)) {
				work.metadata.links.push({
					title: link.title,
					url: link.url
				});
			}
		});
	}

	const metadataFields = [
		'subjects',
		'subject_places',
		'subject_people',
		'description',
		'subject_times',
		'cover_edition',
		'works',
		'lc_classifications',
		'first_publish_date',
		'dewey_number',
		'first_sentence',
		'excerpts',
		'number_of_editions',
		'remote_ids'
	];

	metadataFields.forEach(field => {
		if (!isNotDefined(json[field])) {
			work.metadata[field] = json[field];
		}
	});

	return work;
}

function processAuthor(json) {
	if (isNotDefined(json)) {
		return null;
	}

	// Base skeleton, remaining keys are added as and when they are extracted
	const author: ParsedAuthor = {
		alias: [],
		ended: false,
		identifiers: [],
		metadata: {
			identifiers: [],
			links: [],
			originId: [],
			relationships: []
		},
		source: 'OpenLibrary'
	};

	// Set up aliases
	// The first alias (in the logical flow) is made to be default alias
	let defaultAlias = true;
	if (!isNotDefined(json.name)) {
		const {name} = json;
		const lang = detectLanguage(name);

		author.alias.push({
			default: defaultAlias,
			languageId: lang,
			name,
			primary: false,
			sortName: sortName(name)
		});
		defaultAlias = false;
	}
	if (!isNotDefined(json.personal_name)) {
		const name = json.personal_name;
		const lang = detectLanguage(name);

		author.alias.push({
			default: defaultAlias,
			languageId: lang,
			name,
			primary: false,
			sortName: sortName(name)
		});
		defaultAlias = false;
	}
	if (!isNotDefined(json.alternate_names) && (json.alternate_names instanceof Array)) {
		json.alternate_names.forEach(name => {
			if (!isNotDefined(name)) {
				const lang = detectLanguage(name);
				author.alias.push({
					default: defaultAlias,
					languageId: lang,
					name,
					primary: false,
					sortName: sortName(name)
				});
				defaultAlias = false;
			}
		});
	}
	if (!isNotDefined(json.fuller_name)) {
		const name = json.title;
		const lang = detectLanguage(name);
		author.alias.push({
			default: defaultAlias,
			languageId: lang,
			name,
			primary: false,
			sortName: sortName(name)
		});
	}


	// Last modified at the source
	if (!isNotDefined(_.get(json, 'last_modified.value'))) {
		author.lastEdited = json.last_modified.value;
	}


	// OriginId for the open library source
	if (!isNotDefined(json.key)) {
		const openLibraryAuthorId = json.key.split('/')[2];

		// No identifier for OL author exists, so only setting up origin Id
		author.originId = openLibraryAuthorId;

		author.metadata.identifiers.push({
			typeId: identifiers.openLibraryAuthorId,
			value: openLibraryAuthorId
		});
	}


	// Author begin and end dates
	if (!isNotDefined(json.birth_date)) {
		author.beginDate = json.birth_date;
		author.type = 'Person';
	}
	if (!isNotDefined(json.death_date)) {
		author.endDate = json.death_date;
		author.ended = true;
		author.type = 'Person';
	}


	// Biography field is used for annotation, tags could be used too?
	if (!isNotDefined(_.get(json, 'bio.value'))) {
		author.annotation = json.bio.value;
	}


	// Inserting links
	if (!isNotDefined(json.links) && (json.links instanceof Array)) {
		json.links.forEach(link => {
			if (!isNotDefined(link.title && link.url)) {
				author.metadata.links.push({
					title: link.title,
					url: link.url
				});
			}
		});
	}
	const linkKeys = ['wikipedia', 'website', 'website_name'];
	linkKeys.forEach(linkKey => {
		if (!isNotDefined(json[linkKey])) {
			author.metadata.links.push({
				title: linkKey,
				url: json[linkKey]
			});
		}
	});


	// Origin Ids for other sources
	if (!isNotDefined(json.source_records) && (json.source_records instanceof Array)) {
		json.source_records.forEach(record => {
			author.metadata.originId.push(record);
		});
	}


	// Relationship - hasAuthored
	if (!isNotDefined(json.works) && (json.works instanceof Array)) {
		json.works.forEach(work => {
			if (!isNotDefined(work.key)) {
				author.metadata.relationships.push({
					type: 'hasAuthored',
					value: work.key
				});
			}
		});
	}


	/* eslint-disable */
	// Supported Identifiers for authors:
	// 		MusicBrainz Artist ID
	// 		VIAF
	// 		ISNI
	// 		LibraryThing Author
	// 		Wikidata ID
	const identifierKeyMapping = {
		'id_librarything': identifiers.libraryThingAuthor,
		'id_wikidata': identifiers.wikidataIdAuthor,
		'id_viaf': identifiers.VIAFAuthor
	};
	/* eslint-enable */

	Object.keys(identifierKeyMapping).forEach(key => {
		if (!isNotDefined(json[key])) {
			author.identifiers.push({
				typeId: identifierKeyMapping[key],
				value: json[key]
			});
		}
	});


	// Fields left out: [photograph, create]
	const metadataFields = [
		// Unclear what the field below is for
		'bio',
		// Unclear what the field below is for
		'comment',
		'date',
		'links',
		'photos',
		'remote_ids',
		'title',
		'location',
		// This fields gives random details about the author
		'entity_type',
		'role',
		'numeration',
		'ocaid',
		'body',
		// Unclear what the field below is for
		'number_of_pages',
		'lc_classification',
		'genres',
		'languages',
		'subjects',
		'publish_country',
		'title_prefix',
		'oclc_numbers',
		'by_statement',
		'dewey_decimal_class',
		'subject_place',
		'notes',
		'covers',
		// Can create a new additional publisher import from this
		'publishers',
		'publish_places',
		'publish_date',
		'publish',
		// Can create a new  additional edition import from this
		'edition_name',
		'pagination',
		// Keys below can be used to enrich the imported data
		// Requires some thought as to how to do it
		'lccn',
		'tags',
		'series',
		'edition_name',
		// ??
		'authors',
		'other_titles',
		'subtitle',
		'subject_name',
		'contributions',
		'	_date',
		'marc'
	];

	metadataFields.forEach(field => {
		if (!isNotDefined(json[field])) {
			author.metadata[field] = json[field];
		}
	});

	return author;
}

function processEdition(json) {
	return json;
}

export default function parser(type: OLEntityType, json): ParsedEntity | null {
	switch (type) {
		case 'work': return processWork(json);
		case 'edition': return processEdition(json);
		case 'author': return processAuthor(json);
		default: return null;
	}
}
