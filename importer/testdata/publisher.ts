import type {ParsedPublisher, QueuedEntity} from 'bookbrainz-data/lib/types/parser.d.ts';

export const entity: QueuedEntity<ParsedPublisher> = {
	"data": {
		"alias": [{
			"name": "BookBrainz Press",
			"sortName": "BookBrainz Press",
			"languageId": 120, // English, TODO: use language codes
			"default": true,
			"primary": true
		}],
		"disambiguation": "import test",
		"typeId": 1, // Publisher
		"areaId": 8, // Antarctica (worldwide is not in the minimal DB)
		"beginDate": "2014",
		"ended": false,
		"identifiers": [],
		"annotation": "Imagine a book which is only published in its BookBrainz annotation",
		"metadata": { // currently unused
			"links": [{
				"title": "Example link",
				"url": "https://example.com/publisher"
			}],
			"relationships": []
		},
		"externalSource": "Testdata"
	},
	"entityType": "Publisher",
	"lastEdited": "2024-07-24",
	"externalIdentifier": "P123", // change this to import another dummy entity
	"externalSource": "Testdata"
};
