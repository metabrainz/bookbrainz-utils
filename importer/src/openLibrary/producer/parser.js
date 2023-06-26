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


import {entityTypes, isNotDefined, sortName} from '../../helpers/utils.ts';
import {identifiers, mapLanguage} from '../../helpers/mapping.js';
import _ from 'lodash';
import {franc} from 'franc-min';


const WORK = 'work';
const EDITION = 'edition';
const AUTHOR = 'author';


function detectLanguage(name) {
	let lang = franc(name);
	lang = lang !== 'und' ? lang : 'eng';

	return mapLanguage(lang);
}

function processWork(json) {
	if (isNotDefined(json)) {
		return null;
	}

	// Base skeleton, remaining keys are added as and when they are extracted
	const work = {
		alias: [],
		entityType: entityTypes.WORK,
		identifiers: [],
		metadata: {
			links: [],
			relationships: []
		},
		source: 'OPENLIBRARY'
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
	const creator = {
		alias: [],
		entityType: entityTypes.CREATOR,
		identifiers: [],
		metadata: {
			identifiers: [],
			links: [],
			originId: [],
			relationships: []
		},
		source: 'OPENLIBRARY'
	};

	// Set up aliases
	// The first alias (in the logical flow) is made to be default alias
	let defaultAlias = true;
	if (!isNotDefined(json.name)) {
		const {name} = json;
		const lang = detectLanguage(name);

		creator.alias.push({
			default: defaultAlias,
			languageId: lang,
			name,
			sortName: sortName(name)
		});
		defaultAlias = false;
	}
	if (!isNotDefined(json.personal_name)) {
		const name = json.personal_name;
		const lang = detectLanguage(name);

		creator.alias.push({
			default: defaultAlias,
			languageId: lang,
			name,
			sortName: sortName(name)
		});
		defaultAlias = false;
	}
	if (!isNotDefined(json.alternate_names) &&
			(json.alternate_names instanceof Array)) {
		json.alternate_names.forEach(name => {
			if (!isNotDefined(name)) {
				const lang = detectLanguage(name);
				creator.alias.push({
					default: defaultAlias,
					languageId: lang,
					name,
					sortName: sortName(name)
				});
				defaultAlias = false;
			}
		});
	}
	if (!isNotDefined(json.fuller_name)) {
		const name = json.title;
		const lang = detectLanguage(name);
		creator.alias.push({
			default: defaultAlias,
			languageId: lang,
			name,
			sortName: sortName(name)
		});
	}


	// Last modified at the source
	if (!isNotDefined(_.get(json, 'last_modified.value'))) {
		creator.lastEdited = json.last_modified.value;
	}


	// OriginId for the open library source
	if (!isNotDefined(json.key)) {
		const openLibraryCreatorId = json.key.split('/')[2];

		// No identifier for OL creator exists, so only setting up origin Id
		creator.originId = openLibraryCreatorId;

		creator.metadata.identifiers.push({
			typeId: identifiers.openLibraryCreatorId,
			value: openLibraryCreatorId
		});
	}


	// Creator begin and end dates
	if (!isNotDefined(json.birth_date)) {
		creator.beginDate = json.birth_date;
		creator.type = 'Person';
	}
	if (!isNotDefined(json.death_date)) {
		creator.endDate = json.death_date;
		creator.type = 'Person';
	}


	// Bio is used for diambiguation, tags can be used too?
	if (!isNotDefined(_.get(json, 'bio.value'))) {
		creator.disambiguation = json.bio.value;
	}


	// Inserting links
	if (!isNotDefined(json.links) && (json.links instanceof Array)) {
		json.links.forEach(link => {
			if (!isNotDefined(link.title && link.url)) {
				creator.metadata.links.push({
					title: link.title,
					url: link.url
				});
			}
		});
	}
	const linkKeys = ['wikipedia', 'website', 'website_name'];
	linkKeys.forEach(linkKey => {
		if (!isNotDefined(json[linkKey])) {
			creator.metadata.links.push({
				title: linkKey,
				url: json[linkKey]
			});
		}
	});


	// Origin Ids for other sources
	if (!isNotDefined(json.source_records) &&
			(json.source_records instanceof Array)) {
		json.source_records.forEach(record => {
			creator.metadata.originId.push(record);
		});
	}


	// Relationship - hasAuthored
	if (!isNotDefined(json.works) && (json.works instanceof Array)) {
		json.works.forEach(work => {
			if (!isNotDefined(work.key)) {
				creator.metadata.relationships.push({
					type: 'hasAuthored',
					value: work.key
				});
			}
		});
	}


	/* eslint-disable */
	// Supported Identifiers for creators:
	// 		MusicBrainz Artist ID
	// 		VIAF
	// 		ISNI
	// 		LibraryThing Author
	// 		Wikidata ID
	const identifierKeyMapping = {
		'id_librarything': identifiers.libraryThingAuthor,
		'id_wikidata': identifiers.wikidataIdCreator,
		'id_viaf': identifiers.VIAFCreator
	};
	/* eslint-enable */

	Object.keys(identifierKeyMapping).forEach(key => {
		if (!isNotDefined(json[key])) {
			creator.identifiers.push({
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
		// This fields gives random details about the creator
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
			creator.metadata[field] = json[field];
		}
	});

	return creator;
}

function processEdition(json) {
	return json;
}

export default function parser(type, json) {
	switch (type) {
		case WORK: return processWork(json);
		case EDITION: return processEdition(json);
		case AUTHOR: return processAuthor(json);
		default: return null;
	}
}
