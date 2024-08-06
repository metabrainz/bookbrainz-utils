import type {ParsedSeries, QueuedEntity} from 'bookbrainz-data/lib/types/parser.d.ts';

export const entity: QueuedEntity<ParsedSeries> = {
	"data": {
		"alias": [{
			"name": "All Adventures of Jane Doe",
			"sortName": "All Adventures of Jane Doe",
			"languageId": 120, // English, TODO: use language codes
			"default": true,
			"primary": true
		}],
		"disambiguation": "import test",
		"entityType": "Work",
		"orderingTypeId": 1, // Automatic
		"identifiers": [],
		"annotation": "Empty series",
		"metadata": { // currently unused
			"links": [{
				"title": "Example link",
				"url": "https://example.com/series"
			}],
			"relationships": []
		},
		"source": "Testdata"
	},
	"entityType": "Series",
	"lastEdited": "2024-07-24",
	"originId": "S123", // change this to import another dummy entity
	"source": "Testdata"
};
