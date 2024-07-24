import type {ParsedEdition, QueuedEntity} from 'bookbrainz-data/lib/types/parser.d.ts';

export const entity: QueuedEntity<ParsedEdition> = {
	"data": {
		"alias": [{
			"name": "The Complete Test Collection",
			"sortName": "Complete Test Collection, The",
			"languageId": 120, // English, TODO: use language codes
			"default": true,
			"primary": true
		}],
		"disambiguation": "import test",
		"editionGroupBbid": "PLEASE-FILL-WITH-VALID-BBID", // has to exist
		"formatId": 2, // Hardcover
		"statusId": 1, // Official
		"releaseEvents": [{"date": "2024-04-23"}],
		"languages": [{"id": 134}, {"id": 145}], // French, German
		"pages": 987,
		"weight": 450,
		"width": 150,
		"height": 270,
		"depth": 75,
		"identifiers": [],
		"annotation": "Unabridged edition with illustrations.",
		"metadata": { // currently unused
			"links": [{
				"title": "Example link",
				"url": "https://example.com/edition"
			}],
			"relationships": []
		},
		"source": "Testdata"
	},
	"entityType": "Edition",
	"lastEdited": "2024-07-24",
	"originId": "E123", // change this to import another dummy entity
	"source": "Testdata"
};
