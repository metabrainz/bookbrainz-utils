import type {ParsedWork, QueuedEntity} from 'bookbrainz-data/lib/types/parser.d.ts';

export const entity: QueuedEntity<ParsedWork> = {
	"data": {
		"alias": [{
			"name": "The Fairytale Test",
			"sortName": "Fairytale Test, The",
			"languageId": 120, // English, TODO: use language codes
			"default": true,
			"primary": true
		}],
		"disambiguation": "import test",
		"typeId": 2, // Short Story
		"identifiers": [],
		"annotation": "Once upon a time...",
		"metadata": { // currently unused
			"links": [{
				"title": "Example link",
				"url": "https://example.com/work"
			}],
			"relationships": []
		},
		"source": "Testdata"
	},
	"entityType": "Work",
	"lastEdited": "2024-07-17",
	"originId": "W123", // change this to import another dummy entity
	"source": "Testdata"
};
