import type {ParsedEditionGroup, QueuedEntity} from 'bookbrainz-data/lib/types/parser.d.ts';

export const entity: QueuedEntity<ParsedEditionGroup> = {
	"data": {
		"alias": [{
			"name": "The Complete Test Collection",
			"sortName": "Complete Test Collection, The",
			"languageId": 120, // English, TODO: use language codes
			"default": true,
			"primary": true
		}],
		"disambiguation": "import test",
		"typeId": 1, // Book
		"identifiers": [],
		"annotation": "Empty edition group",
		"metadata": { // currently unused
			"links": [{
				"title": "Example link",
				"url": "https://example.com/edition-group"
			}],
			"relationships": []
		},
		"externalSource": "Testdata"
	},
	"entityType": "EditionGroup",
	"lastEdited": "2024-07-22",
	"externalIdentifier": "G123", // change this to import another dummy entity
	"externalSource": "Testdata"
};
