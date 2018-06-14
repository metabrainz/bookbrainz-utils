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


import {entityTypes, isNotDefined} from '../../helpers/utils';
import _ from 'lodash';
import franc from 'franc-min';


const WORK = 'work';
const EDITION = 'edition';
const AUTHOR = 'author';


function detectLanguage(name) {
	let lang = franc(name);
	lang = lang !== 'und' ? lang : 'eng';

	return lang;
}

function processWork(json) {
	if (isNotDefined(json)) {
		return null;
	}

	const work = {};
	work.alias = [];
	work.metadata = {};
	work.metadata.relationships = [];
	work.metadata.links = [];
	work.identifiers = [];

	work.entityType = entityTypes.WORK;

	// Set up aliases
	// The first alias (in the logical flow) is made to be default/primary alias
	let defaultAlias = true;
	if (!isNotDefined(json.title)) {
		const lang = detectLanguage(json.title);

		work.alias.push({
			default: defaultAlias,
			language: lang,
			name: json.title
		});
		defaultAlias = false;
	}
	if (!isNotDefined(json.subtitle)) {
		const lang = detectLanguage(json.subtitle);

		work.alias.push({
			default: defaultAlias,
			language: lang,
			name: json.subtitle
		});
		defaultAlias = false;
	}


	// Last Edited at source
	if (!isNotDefined(_.get(json, 'last_modified.value'))) {
		work.lastEdited = json.last_modified.value;
	}

	if (!isNotDefined(json.key)) {
		const openLibraryWorkId = json.key.split('/')[2];
		work.identifiers.push({openLibraryWorkId});
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
		work.disambiguation = json.description;
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

	const creator = {};
	creator.alias = [];
	creator.identifiers = [];

	creator.metadata = {};
	creator.metadata.relationships = [];
	creator.metadata.links = [];
	creator.metadata.originId = [];
	creator.metadata.identifiers = [];

	creator.entityType = entityTypes.CREATOR;

	// Set up aliases
	// The first alias (in the logical flow) is made to be default/primary alias
	let defaultAlias = true;
	if (!isNotDefined(json.name)) {
		const lang = detectLanguage(json.name);

		creator.alias.push({
			default: defaultAlias,
			language: lang,
			name: json.name
		});
		defaultAlias = false;
	}
	if (!isNotDefined(json.personal_name)) {
		const lang = detectLanguage(json.personal_name);

		creator.alias.push({
			default: defaultAlias,
			language: lang,
			name: json.subtitle
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
					language: lang,
					name
				});
				defaultAlias = false;
			}
		});
	}
	if (!isNotDefined(json.fuller_name)) {
		const lang = detectLanguage(json.fuller_name);
		creator.alias.push({
			default: false,
			language: lang,
			name: json.fuller_name
		});
	}


	// Last modified at the source
	if (!isNotDefined(_.get(json, 'last_modified.value'))) {
		creator.lastEdited = json.last_modified.value;
	}



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
