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
import franc from 'franc-min';
import {isNotDefined} from '../../helpers/utils';


const WORK = 'work';
const EDITION = 'edition';
const AUTHOR = 'author';


function detectLanguage(name) {
	let lang = franc(name);
	lang = lang !== 'und' ? lang : 'eng';

	return lang;
}

function processWork(json) {
	const work = {};
	work.alias = [];
	work.metadata = {};
	work.metadata.relationships = [];
	work.identifiers = [];

	if (!isNotDefined(json.title)) {
		let lang = franc(json.title);
		lang = lang !== 'und' ? lang : 'eng';

		work.alias.push({
			default: true,
			language: lang,
			name: json.title
		});
	}

	if (!isNotDefined(json.subtitle)) {
		let lang = franc(json.subtitle);
		lang = lang !== 'und' ? lang : 'eng';

		work.alias.push({
			default: false,
			language: lang,
			name: json.subtitle
		});
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

	const remainingFields = [
		'subjects',
		'subject_places',
		'subject_people',
		// Description left to preserve disambiguation value even after upgrade
		'description',
		'subject_times',
		'cover_edition',
		'links',
		'works',
		'lc_classifications',
		'first_publish_date',
		'dewey_number',
		'first_sentence',
		'excerpts',
		'number_of_editions',
		'remote_ids'
	];

	remainingFields.forEach(field => {
		if (!isNotDefined(json[field])) {
			work.metadata[field] = json[field];
		}
	});

	return work;
}

function processAuthor(json) {
	return json;
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
